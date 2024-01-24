import { DataSourcePluginOptionsEditorProps } from '@grafarg/data';
import { DataSourceHttpSettings } from '@grafarg/ui';
import { TraceToLogsSettings } from 'app/core/components/TraceToLogsSettings';
import React from 'react';

export type Props = DataSourcePluginOptionsEditorProps;

export const ConfigEditor: React.FC<Props> = ({ options, onOptionsChange }) => {
  return (
    <>
      <DataSourceHttpSettings
        defaultUrl="http://tempo"
        dataSourceConfig={options}
        showAccessOptions={false}
        onChange={onOptionsChange}
      />

      <TraceToLogsSettings options={options} onOptionsChange={onOptionsChange} />
    </>
  );
};
