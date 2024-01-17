import { DataSourceInstanceSettings } from './datasource';
import { PanelPluginMeta } from './panel';
import { GrafargTheme } from './theme';
import { SystemDateFormatSettings } from '../datetime';

/**
 * Describes the build information that will be available via the Grafarg configuration.
 *
 * @public
 */
export interface BuildInfo {
  version: string;
  commit: string;
  /**
   * Is set to true when running Grafarg Enterprise edition.
   *
   * @deprecated use `licenseInfo.hasLicense` instead
   */
  isEnterprise: boolean;
  env: string;
  edition: GrafargEdition;
  latestVersion: string;
  hasUpdate: boolean;
  hideVersion: boolean;
}

/**
 * @internal
 */
export enum GrafargEdition {
  OpenSource = 'Open Source',
  Pro = 'Pro',
  Enterprise = 'Enterprise',
}

/**
 * Describes available feature toggles in Grafarg. These can be configured via the
 * `conf/custom.ini` to enable features under development or not yet available in
 * stable version.
 *
 * @public
 */
export interface FeatureToggles {
  live: boolean;
  ngalert: boolean;
  panelLibrary: boolean;

  /**
   * @remarks
   * Available only in Grafarg Enterprise
   */
  meta: boolean;
  reportVariables: boolean;
}

/**
 * Describes the license information about the current running instance of Grafarg.
 *
 * @public
 */
export interface LicenseInfo {
  hasLicense: boolean;
  expiry: number;
  licenseUrl: string;
  stateInfo: string;
  hasValidLicense: boolean;
  edition: GrafargEdition;
}

/**
 * Describes Sentry integration config
 *
 * @public
 */
export interface SentryConfig {
  enabled: boolean;
  dsn: string;
  customEndpoint: string;
  sampleRate: number;
}

/**
 * Describes all the different Grafarg configuration values available for an instance.
 *
 * @public
 */
export interface GrafargConfig {
  datasources: { [str: string]: DataSourceInstanceSettings };
  panels: { [key: string]: PanelPluginMeta };
  minRefreshInterval: string;
  appSubUrl: string;
  windowTitlePrefix: string;
  buildInfo: BuildInfo;
  newPanelTitle: string;
  bootData: any;
  externalUserMngLinkUrl: string;
  externalUserMngLinkName: string;
  externalUserMngInfo: string;
  allowOrgCreate: boolean;
  disableLoginForm: boolean;
  defaultDatasource: string;
  alertingEnabled: boolean;
  alertingErrorOrTimeout: string;
  alertingNoDataOrNullValues: string;
  alertingMinInterval: number;
  authProxyEnabled: boolean;
  exploreEnabled: boolean;
  ldapEnabled: boolean;
  sigV4AuthEnabled: boolean;
  samlEnabled: boolean;
  autoAssignOrg: boolean;
  verifyEmailEnabled: boolean;
  oauth: any;
  disableUserSignUp: boolean;
  loginHint: any;
  passwordHint: any;
  loginError: any;
  navTree: any;
  viewersCanEdit: boolean;
  editorsCanAdmin: boolean;
  disableSanitizeHtml: boolean;
  theme: GrafargTheme;
  pluginsToPreload: string[];
  featureToggles: FeatureToggles;
  licenseInfo: LicenseInfo;
  http2Enabled: boolean;
  dateFormats?: SystemDateFormatSettings;
  sentry: SentryConfig;
  customTheme?: any;
}
