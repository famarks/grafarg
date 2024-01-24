import { DataSourcePlugin } from '@grafarg/data';
import { GrafargDatasource } from './datasource';
import { QueryEditor } from './components/QueryEditor';
import { GrafargQuery } from './types';
import { GrafargAnnotationsQueryCtrl } from './annotation_ctrl';

export const plugin = new DataSourcePlugin<GrafargDatasource, GrafargQuery>(GrafargDatasource)
  .setQueryEditor(QueryEditor)
  .setAnnotationQueryCtrl(GrafargAnnotationsQueryCtrl);
