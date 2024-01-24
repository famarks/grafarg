import { LiveChannel, LiveChannelAddress } from '@grafarg/data';
import { Observable } from 'rxjs';

/**
 * @alpha -- experimental
 */
export interface GrafargLiveSrv {
  /**
   * Is the server currently connected
   */
  isConnected(): boolean;

  /**
   * Listen for changes to the main service
   */
  getConnectionState(): Observable<boolean>;

  /**
   * Get a channel.  If the scope, namespace, or path is invalid, a shutdown
   * channel will be returned with an error state indicated in its status.
   *
   * This is a singleton instance that stays active until explicitly shutdown.
   * Multiple requests for this channel will return the same object until
   * the channel is shutdown
   */
  getChannel<TMessage, TPublish = any>(address: LiveChannelAddress): LiveChannel<TMessage, TPublish>;
}

let singletonInstance: GrafargLiveSrv;

/**
 * Used during startup by Grafarg to set the GrafargLiveSrv so it is available
 * via the {@link getGrafargLiveSrv} to the rest of the application.
 *
 * @internal
 */
export const setGrafargLiveSrv = (instance: GrafargLiveSrv) => {
  singletonInstance = instance;
};

/**
 * Used to retrieve the GrafargLiveSrv that allows you to subscribe to
 * server side events and streams
 *
 * @alpha -- experimental
 */
export const getGrafargLiveSrv = (): GrafargLiveSrv => singletonInstance;
