import React, { useCallback } from 'react';
import { DataQuery, DataSourceApi, DataSourceJsonData, QueryEditorProps, StandardVariableQuery } from '@grafarg/data';
import { getTemplateSrv } from '@grafarg/runtime';

import { LegacyVariableQueryEditor } from './LegacyVariableQueryEditor';
import {
  hasCustomVariableSupport,
  hasDatasourceVariableSupport,
  hasLegacyVariableSupport,
  hasStandardVariableSupport,
} from '../guard';
import { importDataSourcePlugin } from '../../plugins/plugin_loader';
import { VariableQueryEditorType } from '../types';

export async function getVariableQueryEditor<
  TQuery extends DataQuery = DataQuery,
  TOptions extends DataSourceJsonData = DataSourceJsonData,
  VariableQuery extends DataQuery = TQuery
>(
  datasource: DataSourceApi<TQuery, TOptions>,
  importDataSourcePluginFunc = importDataSourcePlugin
): Promise<VariableQueryEditorType> {
  if (hasCustomVariableSupport(datasource)) {
    return datasource.variables.editor;
  }

  if (hasDatasourceVariableSupport(datasource)) {
    const dsPlugin = await importDataSourcePluginFunc(datasource.meta!);

    if (!dsPlugin.components.QueryEditor) {
      throw new Error('Missing QueryEditor in plugin definition.');
    }

    return dsPlugin.components.QueryEditor ?? null;
  }

  if (hasStandardVariableSupport(datasource)) {
    return StandardVariableQueryEditor;
  }

  if (hasLegacyVariableSupport(datasource)) {
    const dsPlugin = await importDataSourcePluginFunc(datasource.meta!);
    return dsPlugin.components.VariableQueryEditor ?? LegacyVariableQueryEditor;
  }

  return null;
}

export function StandardVariableQueryEditor<
  TQuery extends DataQuery = DataQuery,
  TOptions extends DataSourceJsonData = DataSourceJsonData
>({
  datasource: propsDatasource,
  query: propsQuery,
  onChange: propsOnChange,
}: QueryEditorProps<any, TQuery, TOptions, StandardVariableQuery>) {
  const onChange = useCallback(
    (query: any) => {
      propsOnChange({ refId: 'StandardVariableQuery', query });
    },
    [propsOnChange]
  );

  return (
    <LegacyVariableQueryEditor
      query={propsQuery.query}
      onChange={onChange}
      datasource={propsDatasource}
      templateSrv={getTemplateSrv()}
    />
  );
}
