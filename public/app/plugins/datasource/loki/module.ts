import { DataSourcePlugin } from '@grafarg/data';
import Datasource from './datasource';

import LokiCheatSheet from './components/LokiCheatSheet';
import LokiExploreQueryEditor from './components/LokiExploreQueryEditor';
import LokiQueryEditor from './components/LokiQueryEditor';
import { LokiAnnotationsQueryCtrl } from './LokiAnnotationsQueryCtrl';
import { ConfigEditor } from './configuration/ConfigEditor';

export const plugin = new DataSourcePlugin(Datasource)
  .setQueryEditor(LokiQueryEditor)
  .setConfigEditor(ConfigEditor)
  .setExploreQueryField(LokiExploreQueryEditor)
  .setQueryEditorHelp(LokiCheatSheet)
  .setAnnotationQueryCtrl(LokiAnnotationsQueryCtrl);
