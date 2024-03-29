import React, { useEffect } from 'react';
import { Alert, DataSourceHttpSettings } from '@grafarg/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafarg/data';
import { ElasticsearchOptions } from '../types';
import { defaultMaxConcurrentShardRequests, ElasticDetails } from './ElasticDetails';
import { LogsConfig } from './LogsConfig';
import { DataLinks } from './DataLinks';
import { config } from 'app/core/config';

export type Props = DataSourcePluginOptionsEditorProps<ElasticsearchOptions>;
export const ConfigEditor = (props: Props) => {
  const { options, onOptionsChange } = props;

  // Apply some defaults on initial render
  useEffect(() => {
    const esVersion = options.jsonData.esVersion || 5;
    onOptionsChange({
      ...options,
      jsonData: {
        ...options.jsonData,
        timeField: options.jsonData.timeField || '@timestamp',
        esVersion,
        maxConcurrentShardRequests:
          options.jsonData.maxConcurrentShardRequests || defaultMaxConcurrentShardRequests(esVersion),
        logMessageField: options.jsonData.logMessageField || '',
        logLevelField: options.jsonData.logLevelField || '',
      },
    });
  }, []);

  return (
    <>
      {options.access === 'direct' && (
        <Alert title="Deprecation Notice" severity="warning">
          Browser access mode in the Elasticsearch datasource is deprecated and will be removed in a future release.
        </Alert>
      )}

      <DataSourceHttpSettings
        defaultUrl={'http://localhost:9200'}
        dataSourceConfig={options}
        showAccessOptions={true}
        onChange={onOptionsChange}
        sigV4AuthToggleEnabled={config.sigV4AuthEnabled}
      />

      <ElasticDetails value={options} onChange={onOptionsChange} />

      <LogsConfig
        value={options.jsonData}
        onChange={(newValue) =>
          onOptionsChange({
            ...options,
            jsonData: newValue,
          })
        }
      />

      <DataLinks
        value={options.jsonData.dataLinks}
        onChange={(newValue) => {
          onOptionsChange({
            ...options,
            jsonData: {
              ...options.jsonData,
              dataLinks: newValue,
            },
          });
        }}
      />
    </>
  );
};
