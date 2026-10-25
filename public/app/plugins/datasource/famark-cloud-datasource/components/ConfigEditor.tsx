import { DataSourcePluginOptionsEditorProps } from '@grafarg/data';
import { DataSourceHttpSettings, InlineField, Input, RadioButtonGroup } from '@grafarg/ui';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { JsonApiDataSourceOptions } from '../types';
import { setSessionPassword, setSessionListener } from '../datasource';

type Props = DataSourcePluginOptionsEditorProps<JsonApiDataSourceOptions>;

/** Auth mode options shown in the radio toggle */
const AUTH_MODE_OPTIONS = [
  { label: 'OAuth Forwarding', value: 'oauth' },
  { label: 'User / Password', value: 'userpass' },
];

const DEFAULT_BASE_URL = 'https://www.famark.com/Host/api.svc/';

// Extract domain from URL (segment after api.svc or last path segment)
const extractDomainFromUrl = (url?: string): string => {
  if (!url) {
    return '';
  }
  const svcPos = url.toLowerCase().lastIndexOf('.svc');
  if (svcPos < 0) {
    return '';
  }
  return url.substring(svcPos + 4).replace(/[\s/]+/g, '');
};

// Update or append domain at the end of the URL
const updateUrlWithDomain = (currentUrl: string | undefined, newDomain: string): string => {
  const base = currentUrl?.trim() || DEFAULT_BASE_URL;
  const svcPos = base.toLowerCase().lastIndexOf('.svc');
  const prefix = svcPos < 0 ? base : base.substring(0, svcPos + 4);
  const domain = newDomain.replace(/[\s/]+/g, '');

  return `${prefix}/${domain}`;
};

/** ConfigEditor lets the user configure connection details like the URL or authentication. */
export const ConfigEditor: React.FC<Props> = ({ options, onOptionsChange }) => {
  // Domain Name (synced with URL ending)
  const domainName = options.jsonData.domainName ?? extractDomainFromUrl(options.url);
  const authMode = options.jsonData.authMode ?? 'oauth';

  // User / Password credentials state
  const credUsername = options.jsonData.credUsername ?? '';
  const [credPassword, setCredPassword] = useState('');

  // Keep a stable ref to the latest onOptionsChange callback
  const onOptionsChangeRef = useRef(onOptionsChange);
  onOptionsChangeRef.current = onOptionsChange;

  // Listen for SessionId updates saved via testDatasource ("Save & Test")
  useEffect(() => {
    setSessionListener((payload?: any) => {
      setCredPassword('');
      onOptionsChangeRef.current(payload);
    });
    return () => setSessionListener(null);
  }, []);

  // On mount: default oauthPassThru to true when authMode is 'oauth' and sync domainName if present in URL
  useEffect(() => {
    const currentAuthMode = options.jsonData.authMode ?? 'oauth';
    const currentOAuthPassThru = options.jsonData.oauthPassThru;
    const needsOAuthDefault = currentAuthMode === 'oauth' && currentOAuthPassThru === undefined;

    const detectedDomain = extractDomainFromUrl(options.url);
    const needsDomainSync = !options.jsonData.domainName && detectedDomain;

    if (needsOAuthDefault || needsDomainSync) {
      onOptionsChangeRef.current({
        ...options,
        jsonData: {
          ...options.jsonData,
          ...(needsOAuthDefault ? { oauthPassThru: true } : {}),
          ...(needsDomainSync ? { domainName: detectedDomain } : {}),
        },
      });
    }
  }, []);

  // When Domain Name input changes: update domainName in jsonData and update ending of URL
  const onDomainNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newDomain = e.currentTarget.value;
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

  const onServiceUrlChange = (newOpts: typeof options) => {
    onOptionsChange({
      ...newOpts,
      jsonData: {
        ...newOpts.jsonData,
        domainName: extractDomainFromUrl(newOpts.url),
      },
    });
  };

  const onParamsChange = (e: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      jsonData: { ...options.jsonData, queryParams: e.currentTarget.value },
    });
  };

  // Auth mode change: updates local form state ONLY.
  // Preserves username & password credentials so switching back doesn't lose user input.
  // No silentPut or DB writes: changes persist only when user clicks "Save & Test".
  const onAuthModeChange = (mode: 'oauth' | 'userpass') => {
    const isOAuth = mode === 'oauth';
    const { httpHeaderName1, ...restJson } = options.jsonData as any;
    onOptionsChange({
      ...options,
      jsonData: { ...(isOAuth ? restJson : options.jsonData), authMode: mode, oauthPassThru: isOAuth },
      secureJsonFields: { ...options.secureJsonFields, ...(isOAuth ? { httpHeaderValue1: false } : {}) },
      ...(isOAuth ? { secureJsonData: { ...(options.secureJsonData ?? {}), httpHeaderValue1: '' } } : {}),
    });
  };

  const onUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value;
    onOptionsChange({
      ...options,
      jsonData: { ...options.jsonData, credUsername: val } as any,
    });
  };

  const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value;
    setCredPassword(val);
    setSessionPassword(val);
  };

  const httpHeaderKey = `${options.jsonData.httpHeaderName1 ?? 'none'}-${options.jsonData.oauthPassThru ?? false}-${
    options.version ?? 0
  }`;

  return (
    <>
      {/* Famark Auth Section (at the top, above HTTP) */}
      <h3 className="page-heading">Famark Auth</h3>
      <div className="gf-form-group">
        <div className="gf-form">
          <InlineField
            label="Auth Mode"
            labelWidth={20}
            tooltip="OAuth Forwarding: passes the signed-in user token. User/Password: fetches a SessionId from Famark."
          >
            <RadioButtonGroup options={AUTH_MODE_OPTIONS} value={authMode} onChange={onAuthModeChange} />
          </InlineField>
        </div>

        {/* Domain Name — shown for both oauth and userpass modes */}
        <div className="gf-form">
          <InlineField label="Domain Name" labelWidth={20} tooltip="Your Famark domain, e.g. 'starter'">
            <Input width={40} value={domainName} onChange={onDomainNameChange} placeholder="Domain Name" />
          </InlineField>
        </div>

        {/* User / Password — additional fields only for userpass mode */}
        {authMode === 'userpass' && (
          <>
            <div className="gf-form">
              <InlineField label="Username" labelWidth={20}>
                <Input
                  width={40}
                  value={credUsername}
                  onChange={onUsernameChange}
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
                    : 'Password used for authentication. Stored encrypted.'
                }
              >
                <Input
                  width={40}
                  type="password"
                  value={credPassword}
                  onChange={onPasswordChange}
                  placeholder={
                    options.secureJsonFields?.password || options.secureJsonFields?.httpHeaderValue1
                      ? 'Configured'
                      : 'Password'
                  }
                  autoComplete="current-password"
                />
              </InlineField>
            </div>
          </>
        )}
      </div>

      {/* Standard Grafarg HTTP Settings: handles URL, Access, Whitelisted Cookies, Auth, and Custom HTTP Headers */}
      <DataSourceHttpSettings
        key={httpHeaderKey}
        defaultUrl={DEFAULT_BASE_URL}
        dataSourceConfig={options}
        onChange={onServiceUrlChange}
      />

      <h3 className="page-heading">Misc</h3>
      <div className="gf-form-group">
        <div className="gf-form">
          <InlineField label="Query string" tooltip="Add a custom query string to your queries.">
            <Input
              width={50}
              value={options.jsonData.queryParams}
              onChange={onParamsChange}
              spellCheck={false}
              placeholder="page=1&limit=100"
            />
          </InlineField>
        </div>
      </div>
    </>
  );
};
