import { AppEvents, DataSourcePluginOptionsEditorProps } from '@grafarg/data';
import { getBackendSrv } from '@grafarg/runtime';
import Api from '../api';
import {
  FieldValidationMessage,
  Button,
  DataSourceHttpSettings,
  InlineField,
  InlineFieldRow,
  InlineFormLabel,
  Input,
  RadioButtonGroup,
} from '@grafarg/ui';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { JsonApiDataSourceOptions } from '../types';
import appEvents from 'app/core/app_events';

type Props = DataSourcePluginOptionsEditorProps<JsonApiDataSourceOptions>;

/** Auth mode options shown in the radio toggle */
const AUTH_MODE_OPTIONS = [
  { label: 'OAuth Forwarding', value: 'oauth' },
  { label: 'User / Password', value: 'userpass' },
];

const DEFAULT_BASE_URL = 'https://www.famark.com/Host/api.svc/';

// Extract domain from URL (segment after api.svc or last path segment)
const extractDomainFromUrl = (url?: string): string => {
  const clean = (url || '')
    .trim()
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '');
  const last = clean.split('/').pop() || '';
  return last.toLowerCase().endsWith('.svc') || clean.split('/').length <= 3 ? '' : last;
};

// Update or append domain at the end of the URL
const updateUrlWithDomain = (currentUrl: string | undefined, newDomain: string): string => {
  const base = (currentUrl?.trim() || DEFAULT_BASE_URL).replace(/[?#].*$/, '').replace(/\/+$/, '');
  const cleanBase = extractDomainFromUrl(base) ? base.slice(0, base.lastIndexOf('/')) : base;
  const domain = newDomain.trim().replace(/^\/+|\/+$/g, '');
  return domain ? `${cleanBase}/${domain}` : `${cleanBase}/`;
};

/** ConfigEditor lets the user configure connection details like the URL or authentication. */
export const ConfigEditor: React.FC<Props> = ({ options, onOptionsChange }) => {
  // Auth mode
  const [authMode, setAuthMode] = useState<'oauth' | 'userpass'>(
    ((options.jsonData as any).authMode ?? 'oauth') as 'oauth' | 'userpass'
  );

  // Domain Name (synced with URL ending)
  const domainName = options.jsonData.domainName ?? extractDomainFromUrl(options.url);

  // User / Password state
  const [credUsername, setCredUsername] = useState<string>(((options.jsonData as any).credUsername ?? '') as string);
  const [credPassword, setCredPassword] = useState('');
  const [credStatus, setCredStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [credError, setCredError] = useState('');
  const [setCount, setSetCount] = useState(0);

  // Auth-mode switch saving state
  const [modeSwitchStatus, setModeSwitchStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [modeSwitchError, setModeSwitchError] = useState('');

  // On mount: default oauthPassThru to true when authMode is 'oauth' and sync domainName if present in URL
  useEffect(() => {
    const currentAuthMode = (options.jsonData as any).authMode ?? 'oauth';
    const currentOAuthPassThru = (options.jsonData as any).oauthPassThru;
    const needsOAuthDefault = currentAuthMode === 'oauth' && currentOAuthPassThru === undefined;

    const detectedDomain = extractDomainFromUrl(options.url);
    const needsDomainSync = !options.jsonData.domainName && detectedDomain;

    if (needsOAuthDefault || needsDomainSync) {
      onOptionsChange({
        ...options,
        jsonData: {
          ...options.jsonData,
          ...(needsOAuthDefault ? { oauthPassThru: true } : {}),
          ...(needsDomainSync ? { domainName: detectedDomain } : {}),
        },
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When Domain Name input changes: update domainName in jsonData and update ending of URL
  const onDomainChange = (newDomain: string) => {
    const newUrl = updateUrlWithDomain(options.url, newDomain);
    onOptionsChange({
      ...options,
      url: newUrl,
      jsonData: {
        ...options.jsonData,
        domainName: newDomain,
      },
    });
  };

  const onParamsChange = (e: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      jsonData: { ...options.jsonData, queryParams: e.currentTarget.value },
    });
  };

  // Helpers: fetch latest version to avoid 409 conflicts
  const fetchLatestVersion = async (): Promise<number | undefined> => {
    if (!options.id) {
      return options.version;
    }
    try {
      const current = await getBackendSrv().get(`/api/datasources/${options.id}`);
      return current.version;
    } catch (_) {
      return options.version;
    }
  };

  // Helper: silently PUT to /api/datasources without triggering Grafana's "Datasource updated" toast
  const silentPut = async (url: string, data: any) => {
    return await getBackendSrv().request({
      method: 'PUT',
      url,
      data,
      showSuccessAlert: false,
    });
  };

  // Auth mode change.
  // When leaving userpass we clear the injected custom header.
  const onAuthModeChange = async (mode: 'oauth' | 'userpass') => {
    setAuthMode(mode);
    setCredStatus('idle');
    setCredError('');
    setModeSwitchStatus('idle');
    setModeSwitchError('');

    const leavingUserPass = authMode === 'userpass' && mode !== 'userpass';

    const updatedJsonData: any = {
      ...options.jsonData,
      authMode: mode,
      oauthPassThru: mode === 'oauth' ? true : false,
    };
    if (leavingUserPass) {
      delete updatedJsonData.httpHeaderName1;
      delete updatedJsonData.credUsername;
    }

    const updatedSecureJsonFields: any = { ...options.secureJsonFields };
    if (leavingUserPass) {
      updatedSecureJsonFields.httpHeaderValue1 = false;
      updatedSecureJsonFields.password = false;
      updatedSecureJsonFields.credPassword = false;
    }

    const updated: any = {
      ...options,
      jsonData: updatedJsonData,
      secureJsonFields: updatedSecureJsonFields,
      ...(leavingUserPass
        ? {
            secureJsonData: {
              ...(options.secureJsonData ?? {}),
              httpHeaderValue1: ' ',
              password: ' ',
              credPassword: ' ',
            },
          }
        : {}),
    };

    onOptionsChange(updated);

    // Persist to DB so the Grafarg proxy stops sending the old header.
    if (options.id && leavingUserPass) {
      setModeSwitchStatus('saving');
      try {
        const latestVersion = await fetchLatestVersion();
        const saved = await silentPut(`/api/datasources/${options.id}`, {
          ...updated,
          version: latestVersion,
        });
        onOptionsChange({
          ...updated,
          version: saved?.datasource?.version ?? latestVersion,
          secureJsonFields: saved?.datasource?.secureJsonFields ?? updatedSecureJsonFields,
        });
        setModeSwitchStatus('idle');
      } catch (err) {
        const msg =
          (err as any)?.data?.message ?? (err as any)?.message ?? 'Failed to save - please click Save & Test manually';
        setModeSwitchStatus('error');
        setModeSwitchError(msg);
        try {
          const current = await getBackendSrv().get(`/api/datasources/${options.id}`);
          onOptionsChange({ ...updated, version: current.version });
        } catch (_) {}
      }
    }
  };

  // User / Password: Connect with username + password, get SessionId, store as custom HTTP header
  const onConnectWithUserPass = async () => {
    const currentDomain = domainName || extractDomainFromUrl(options.url);
    const hasSavedSecret = Boolean(
      options.secureJsonFields?.password ||
        options.secureJsonFields?.credPassword ||
        options.secureJsonFields?.httpHeaderValue1
    );
    const needPassword = !credPassword && !hasSavedSecret;
    const missing = [
      !options.url && 'URL',
      !currentDomain && 'Domain Name',
      !credUsername && 'Username',
      needPassword && 'Password',
    ].filter(Boolean);

    if (missing.length) {
      setCredError(`${missing.join(missing.length === 2 ? ' and ' : ', ')} required`);
      setCredStatus('error');
      return;
    }
    setCredStatus('loading');
    setCredError('');
    try {
      const latestVersion = await fetchLatestVersion();

      // Step 1: save current options so proxy knows where to forward
      const opts: any = {
        ...options,
        version: latestVersion,
        jsonData: {
          ...options.jsonData,
          domainName: currentDomain,
          authMode: 'userpass',
          credUsername,
        },
      };
      if (options.id) {
        const saved = await silentPut(`/api/datasources/${options.id}`, opts);
        opts.version = saved?.datasource?.version ?? opts.version;
      }

      // Step 2: call /Credential/Connect through the proxy
      let sessionId: string | undefined;
      if (credPassword) {
        const body = JSON.stringify({ DomainName: currentDomain, UserName: credUsername, Password: credPassword });
        sessionId = await new Api('/api/datasources/proxy/' + options.id, '').get(
          'POST',
          '/Credential/Connect',
          [],
          [['Content-Type', 'application/json']],
          body,
          { hideFromInspector: true }
        );
      }

      // Step 3: save SessionId and Password in secureJsonData
      const finalSecureJsonData: any = { ...(options.secureJsonData ?? {}) };
      if (credPassword) {
        finalSecureJsonData.password = credPassword;
        finalSecureJsonData.credPassword = credPassword;
      }
      if (sessionId) {
        finalSecureJsonData.httpHeaderValue1 = sessionId;
      }

      const final: any = {
        ...opts,
        jsonData: {
          ...opts.jsonData,
          httpHeaderName1: 'SessionId',
          oauthPassThru: false,
        },
        secureJsonData: finalSecureJsonData,
        secureJsonFields: {
          ...options.secureJsonFields,
          httpHeaderValue1: true,
          password: true,
          credPassword: true,
        },
      };

      if (options.id) {
        const saved = await silentPut(`/api/datasources/${options.id}`, final);
        final.version = saved?.datasource?.version ?? opts.version;
        if (saved?.datasource?.secureJsonFields) {
          final.secureJsonFields = saved.datasource.secureJsonFields;
        }
      }

      onOptionsChange(final);
      setCredPassword('');
      setCredStatus('idle');
      setSetCount((c) => c + 1);
      appEvents.emit(AppEvents.alertSuccess, ['Connected successfully. SessionId set as custom HTTP header.']);
    } catch (err) {
      if (options.id) {
        try {
          const current = await getBackendSrv().get(`/api/datasources/${options.id}`);
          onOptionsChange({ ...options, version: current.version });
        } catch (_) {}
      }
      setCredError((err as any)?.data?.ErrorMessage ?? (err as any)?.message ?? 'Connection failed');
      setCredStatus('error');
    }
  };

  const httpHeaderKey = `${(options.jsonData as any).httpHeaderName1 ?? 'none'}-${setCount}`;

  return (
    <>
      {/* Famark Auth Section (at the top, above HTTP) */}
      <h3 className="page-heading">Famark Auth</h3>
      <div className="gf-form-group">
        <div className="gf-form">
          <InlineFormLabel
            width={20}
            tooltip="OAuth Forwarding: passes the signed-in user token. User/Password: fetches a SessionId from Famark."
          >
            Auth Mode
          </InlineFormLabel>
          <RadioButtonGroup
            options={AUTH_MODE_OPTIONS}
            value={authMode}
            onChange={(v) => onAuthModeChange(v as 'oauth' | 'userpass')}
          />
        </div>

        {modeSwitchStatus === 'error' && (
          <div className="gf-form">
            <FieldValidationMessage>
              {modeSwitchError + ' - please click Save & Test to finish clearing the session.'}
            </FieldValidationMessage>
          </div>
        )}

        {/* OAuth Forwarding */}
        {authMode === 'oauth' && (
          <div className="gf-form">
            <InlineField label="Domain Name" labelWidth={20} tooltip="Your Famark domain, e.g. 'starter'">
              <Input
                width={40}
                value={domainName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onDomainChange(e.currentTarget.value)}
                placeholder="starter"
              />
            </InlineField>
          </div>
        )}

        {/* User / Password */}
        {authMode === 'userpass' && (
          <>
            <div className="gf-form">
              <InlineField label="Domain Name" labelWidth={20} tooltip="Your Famark domain, e.g. 'starter'">
                <Input
                  width={40}
                  value={domainName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => onDomainChange(e.currentTarget.value)}
                  placeholder="starter"
                />
              </InlineField>
            </div>

            <div className="gf-form">
              <InlineField label="Username" labelWidth={20}>
                <Input
                  width={40}
                  value={credUsername}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setCredUsername(e.currentTarget.value)}
                  onBlur={() => {
                    onOptionsChange({
                      ...options,
                      jsonData: { ...options.jsonData, credUsername } as any,
                    });
                  }}
                  placeholder="Username"
                  autoComplete="username"
                />
              </InlineField>
            </div>

            <div className="gf-form">
              <InlineField
                label="Password"
                labelWidth={20}
                tooltip={
                  options.secureJsonFields?.password || options.secureJsonFields?.httpHeaderValue1
                    ? 'Password saved. Enter a new one to change.'
                    : 'Password used to fetch a SessionId from Famark. Stored encrypted.'
                }
              >
                <Input
                  width={40}
                  type="password"
                  value={credPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setCredPassword(e.currentTarget.value)}
                  placeholder={
                    options.secureJsonFields?.password || options.secureJsonFields?.httpHeaderValue1
                      ? 'configured'
                      : 'Password'
                  }
                  autoComplete="current-password"
                />
              </InlineField>
            </div>

            <div className="gf-form">
              <Button variant="primary" size="sm" onClick={onConnectWithUserPass} disabled={credStatus === 'loading'}>
                {credStatus === 'loading' ? 'Connecting...' : 'Connect'}
              </Button>
            </div>

            {credStatus === 'error' && <FieldValidationMessage>{credError}</FieldValidationMessage>}
          </>
        )}
      </div>

      {/* Standard Grafarg HTTP Settings: handles URL, Access, Whitelisted Cookies, Auth, and Custom HTTP Headers */}
      <DataSourceHttpSettings
        key={httpHeaderKey}
        defaultUrl={DEFAULT_BASE_URL}
        dataSourceConfig={options}
        onChange={(newOpts) => {
          const jd = newOpts.jsonData as JsonApiDataSourceOptions;
          const sessionHeaderDeleted = !!(options.jsonData as any).httpHeaderName1 && !(jd as any).httpHeaderName1;
          const updatedSecureJsonFields = sessionHeaderDeleted
            ? { ...newOpts.secureJsonFields, httpHeaderValue1: false, password: false, credPassword: false }
            : newOpts.secureJsonFields;

          // When user edits URL in DataSourceHttpSettings, auto-extract the domain name from the URL ending
          const urlDomain = extractDomainFromUrl(newOpts.url);

          onOptionsChange({
            ...newOpts,
            jsonData: {
              ...jd,
              domainName: urlDomain !== undefined ? urlDomain : jd.domainName,
              oauthPassThru: jd.oauthPassThru,
            },
            secureJsonFields: updatedSecureJsonFields,
            ...(sessionHeaderDeleted
              ? {
                  secureJsonData: {
                    ...(newOpts.secureJsonData ?? {}),
                    httpHeaderValue1: ' ',
                    password: ' ',
                    credPassword: ' ',
                  },
                }
              : {}),
          });
        }}
      />

      <h3 className="page-heading">Misc</h3>
      <InlineFieldRow>
        <InlineField label="Query string" tooltip="Add a custom query string to your queries.">
          <Input
            width={50}
            value={options.jsonData.queryParams}
            onChange={onParamsChange}
            spellCheck={false}
            placeholder="page=1&limit=100"
          />
        </InlineField>
      </InlineFieldRow>
    </>
  );
};
