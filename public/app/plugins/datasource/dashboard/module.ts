import { DashboardDatasource } from './datasource';
import { DataSourcePlugin } from '@grafarg/data';

export const plugin = new DataSourcePlugin(DashboardDatasource);
