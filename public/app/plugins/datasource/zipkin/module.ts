import { DataSourcePlugin } from '@grafarg/data';
import { ZipkinDatasource } from './datasource';
import { QueryField } from './QueryField';
import { ConfigEditor } from './ConfigEditor';

export const plugin = new DataSourcePlugin(ZipkinDatasource)
  .setConfigEditor(ConfigEditor)
  .setExploreQueryField(QueryField);
