import merge from 'lodash/merge';
import { getTheme } from '@grafarg/ui';
import {
  BuildInfo,
  DataSourceInstanceSettings,
  FeatureToggles,
  GrafargConfig,
  GrafargTheme,
  GrafargThemeType,
  LicenseInfo,
  PanelPluginMeta,
  systemDateFormats,
  SystemDateFormatSettings,
} from '@grafarg/data';

export class GrafargBootConfig implements GrafargConfig {
  datasources: { [str: string]: DataSourceInstanceSettings } = {};
  panels: { [key: string]: PanelPluginMeta } = {};
  minRefreshInterval = '';
  appUrl = '';
  appSubUrl = '';
  windowTitlePrefix = '';
  buildInfo: BuildInfo = {} as BuildInfo;
  newPanelTitle = '';
  bootData: any;
  externalUserMngLinkUrl = '';
  externalUserMngLinkName = '';
  externalUserMngInfo = '';
  allowOrgCreate = false;
  disableLoginForm = false;
  defaultDatasource = '';
  alertingEnabled = false;
  alertingErrorOrTimeout = '';
  alertingNoDataOrNullValues = '';
  alertingMinInterval = 1;
  authProxyEnabled = false;
  exploreEnabled = false;
  ldapEnabled = false;
  sigV4AuthEnabled = false;
  samlEnabled = false;
  autoAssignOrg = true;
  verifyEmailEnabled = false;
  oauth: any;
  disableUserSignUp = false;
  loginHint: any;
  passwordHint: any;
  loginError: any;
  navTree: any;
  viewersCanEdit = false;
  editorsCanAdmin = false;
  disableSanitizeHtml = false;
  theme: GrafargTheme;
  pluginsToPreload: string[] = [];
  featureToggles: FeatureToggles = {
    live: false,
    meta: false,
    ngalert: false,
    panelLibrary: false,
    reportVariables: false,
  };
  licenseInfo: LicenseInfo = {} as LicenseInfo;
  rendererAvailable = false;
  http2Enabled = false;
  dateFormats?: SystemDateFormatSettings;
  sentry = {
    enabled: false,
    dsn: '',
    customEndpoint: '',
    sampleRate: 1,
  };
  marketplaceUrl?: string;
  expressionsEnabled = false;
  customTheme?: any;
  awsAllowedAuthProviders: string[] = [];
  awsAssumeRoleEnabled = false;

  constructor(options: GrafargBootConfig) {
    this.theme = options.bootData.user.lightTheme ? getTheme(GrafargThemeType.Light) : getTheme(GrafargThemeType.Dark);

    const defaults = {
      datasources: {},
      windowTitlePrefix: 'Grafarg - ',
      panels: {},
      newPanelTitle: 'Panel Title',
      playlist_timespan: '1m',
      unsaved_changes_warning: true,
      appUrl: '',
      appSubUrl: '',
      buildInfo: {
        version: 'v1.0',
        commit: '1',
        env: 'production',
        isEnterprise: false,
      },
      viewersCanEdit: false,
      editorsCanAdmin: false,
      disableSanitizeHtml: false,
    };

    merge(this, defaults, options);

    if (this.dateFormats) {
      systemDateFormats.update(this.dateFormats);
    }
  }
}

const bootData = (window as any).grafargBootData || {
  settings: {},
  user: {},
  navTree: [],
};

const options = bootData.settings;
options.bootData = bootData;

/**
 * Use this to access the {@link GrafargBootConfig} for the current running Grafarg instance.
 *
 * @public
 */
export const config = new GrafargBootConfig(options);
