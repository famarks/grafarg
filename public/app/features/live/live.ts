import Centrifuge from 'centrifuge/dist/centrifuge.protobuf';
import { GrafargLiveSrv, setGrafargLiveSrv, getGrafargLiveSrv, config } from '@grafarg/runtime';
import { BehaviorSubject } from 'rxjs';
import { LiveChannel, LiveChannelScope, LiveChannelAddress } from '@grafarg/data';
import { CentrifugeLiveChannel, getErrorChannel } from './channel';
import {
  GrafargLiveScope,
  grafargLiveCoreFeatures,
  GrafargLiveDataSourceScope,
  GrafargLivePluginScope,
} from './scopes';
import { registerLiveFeatures } from './features';

export const sessionId =
  (window as any)?.grafargBootData?.user?.id +
  '/' +
  Date.now().toString(16) +
  '/' +
  Math.random().toString(36).substring(2, 15);

export class CentrifugeSrv implements GrafargLiveSrv {
  readonly open = new Map<string, CentrifugeLiveChannel>();

  readonly centrifuge: Centrifuge;
  readonly connectionState: BehaviorSubject<boolean>;
  readonly connectionBlocker: Promise<void>;
  readonly scopes: Record<LiveChannelScope, GrafargLiveScope>;

  constructor() {
    // build live url replacing scheme in appUrl.
    const liveUrl = `${config.appUrl}live/ws`.replace(/^(http)(s)?:\/\//, 'ws$2://');
    this.centrifuge = new Centrifuge(liveUrl, {
      debug: true,
    });
    this.centrifuge.setConnectData({
      sessionId,
    });
    this.centrifuge.connect(); // do connection
    this.connectionState = new BehaviorSubject<boolean>(this.centrifuge.isConnected());
    this.connectionBlocker = new Promise<void>((resolve) => {
      if (this.centrifuge.isConnected()) {
        return resolve();
      }
      const connectListener = () => {
        resolve();
        this.centrifuge.removeListener('connect', connectListener);
      };
      this.centrifuge.addListener('connect', connectListener);
    });

    this.scopes = {
      [LiveChannelScope.Grafarg]: grafargLiveCoreFeatures,
      [LiveChannelScope.DataSource]: new GrafargLiveDataSourceScope(),
      [LiveChannelScope.Plugin]: new GrafargLivePluginScope(),
    };

    // Register global listeners
    this.centrifuge.on('connect', this.onConnect);
    this.centrifuge.on('disconnect', this.onDisconnect);
    this.centrifuge.on('publish', this.onServerSideMessage);
  }

  //----------------------------------------------------------
  // Internal functions
  //----------------------------------------------------------

  onConnect = (context: any) => {
    console.log('CONNECT', context);
    this.connectionState.next(true);
  };

  onDisconnect = (context: any) => {
    console.log('onDisconnect', context);
    this.connectionState.next(false);
  };

  onServerSideMessage = (context: any) => {
    console.log('Publication from server-side channel', context);
  };

  /**
   * Get a channel.  If the scope, namespace, or path is invalid, a shutdown
   * channel will be returned with an error state indicated in its status
   */
  getChannel<TMessage, TPublish = any>(addr: LiveChannelAddress): LiveChannel<TMessage, TPublish> {
    const id = `${addr.scope}/${addr.namespace}/${addr.path}`;
    let channel = this.open.get(id);
    if (channel != null) {
      return channel;
    }

    const scope = this.scopes[addr.scope];
    if (!scope) {
      return getErrorChannel('invalid scope', id, addr);
    }

    channel = new CentrifugeLiveChannel(id, addr);
    channel.shutdownCallback = () => {
      this.open.delete(id); // remove it from the list of open channels
    };
    this.open.set(id, channel);

    // Initialize the channel in the background
    this.initChannel(scope, channel).catch((err) => {
      channel?.shutdownWithError(err);
      this.open.delete(id);
    });

    // return the not-yet initalized channel
    return channel;
  }

  private async initChannel(scope: GrafargLiveScope, channel: CentrifugeLiveChannel): Promise<void> {
    const { addr } = channel;
    const support = await scope.getChannelSupport(addr.namespace);
    if (!support) {
      throw new Error(channel.addr.namespace + 'does not support streaming');
    }
    const config = support.getChannelConfig(addr.path);
    if (!config) {
      throw new Error('unknown path: ' + addr.path);
    }
    if (config.canPublish?.()) {
      channel.publish = (data: any) => this.centrifuge.publish(channel.id, data);
    }
    const events = channel.initalize(config);
    if (!this.centrifuge.isConnected()) {
      await this.connectionBlocker;
    }
    channel.subscription = this.centrifuge.subscribe(channel.id, events);
    return;
  }

  //----------------------------------------------------------
  // Exported functions
  //----------------------------------------------------------

  /**
   * Is the server currently connected
   */
  isConnected() {
    return this.centrifuge.isConnected();
  }

  /**
   * Listen for changes to the connection state
   */
  getConnectionState() {
    return this.connectionState.asObservable();
  }
}

export function getGrafargLiveCentrifugeSrv() {
  return getGrafargLiveSrv() as CentrifugeSrv;
}

export function initGrafargLive() {
  setGrafargLiveSrv(new CentrifugeSrv());
  registerLiveFeatures();
}
