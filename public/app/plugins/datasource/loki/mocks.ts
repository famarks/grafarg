import { LokiDatasource, LOKI_ENDPOINT } from './datasource';
import { AbsoluteTimeRange, DataSourceSettings } from '@grafarg/data';
import { LokiOptions } from './types';
import { createDatasourceSettings } from '../../../features/datasources/mocks';

interface Labels {
  [label: string]: string[];
}

interface Series {
  [label: string]: string;
}

interface SeriesForSelector {
  [selector: string]: Series[];
}

export function makeMockLokiDatasource(labelsAndValues: Labels, series?: SeriesForSelector): LokiDatasource {
  const lokiLabelsAndValuesEndpointRegex = /^\/loki\/api\/v1\/label\/(\w*)\/values/;
  const lokiSeriesEndpointRegex = /^\/loki\/api\/v1\/series/;

  const lokiLabelsEndpoint = `${LOKI_ENDPOINT}/label`;
  const rangeMock: AbsoluteTimeRange = {
    from: 1560153109000,
    to: 1560163909000,
  };

  const labels = Object.keys(labelsAndValues);
  return {
    getTimeRangeParams: () => rangeMock,
    metadataRequest: (url: string, params?: { [key: string]: string }) => {
      if (url === lokiLabelsEndpoint) {
        return labels;
      } else {
        const labelsMatch = url.match(lokiLabelsAndValuesEndpointRegex);
        const seriesMatch = url.match(lokiSeriesEndpointRegex);
        if (labelsMatch) {
          return labelsAndValues[labelsMatch[1]] || [];
        } else if (seriesMatch && series && params) {
          return series[params.match] || [];
        } else {
          throw new Error(`Unexpected url error, ${url}`);
        }
      }
    },
  } as any;
}

export function createDefaultConfigOptions(): DataSourceSettings<LokiOptions> {
  return createDatasourceSettings<LokiOptions>({
    maxLines: '531',
  });
}
