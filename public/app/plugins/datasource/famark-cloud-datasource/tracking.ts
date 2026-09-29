import { CoreApp, DataQueryRequest } from '@grafarg/data';
//import { reportInteraction } from '@grafarg/runtime';
import { JsonApiQuery } from './types';

export const trackRequest = (request: DataQueryRequest<JsonApiQuery>) => {
  // commented out tracking for now as it is not yet available in @grafarg/runtime
  // also removed || request.app === CoreApp.PanelViewer in following if statement
  if (request.app === CoreApp.Dashboard) {
    return;
  }

  // request.targets.forEach((target) => {
  //   reportInteraction('grafarg_json_query_executed', {
  //     app: request.app,
  //     cacheDurationSeconds: target.cacheDurationSeconds,
  //     method: target.method,
  //   });
  // });
};
