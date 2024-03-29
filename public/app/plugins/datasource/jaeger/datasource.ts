import {
  DataQuery,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  dateMath,
  DateTime,
  FieldType,
  MutableDataFrame,
} from '@grafarg/data';
import { BackendSrvRequest, getBackendSrv } from '@grafarg/runtime';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { getTimeSrv, TimeSrv } from 'app/features/dashboard/services/TimeSrv';
import { serializeParams } from 'app/core/utils/fetch';
import { createTraceFrame } from './responseTransform';

export type JaegerQuery = {
  query: string;
} & DataQuery;

export class JaegerDatasource extends DataSourceApi<JaegerQuery> {
  constructor(private instanceSettings: DataSourceInstanceSettings, private readonly timeSrv: TimeSrv = getTimeSrv()) {
    super(instanceSettings);
  }

  async metadataRequest(url: string, params?: Record<string, any>): Promise<any> {
    const res = await this._request(url, params, { hideFromInspector: true }).toPromise();
    return res.data.data;
  }

  query(options: DataQueryRequest<JaegerQuery>): Observable<DataQueryResponse> {
    // At this moment we expect only one target. In case we somehow change the UI to be able to show multiple
    // traces at one we need to change this.
    const id = options.targets[0]?.query;
    if (!id) {
      return of({ data: [emptyTraceDataFrame] });
    }

    // TODO: this api is internal, used in jaeger ui. Officially they have gRPC api that should be used.
    return this._request(`/api/traces/${encodeURIComponent(id)}`).pipe(
      map((response) => {
        return {
          data: [createTraceFrame(response?.data?.data?.[0] || [])],
        };
      })
    );
  }

  async testDatasource(): Promise<any> {
    return this._request('/api/services')
      .pipe(
        map((res) => {
          const values: any[] = res?.data?.data || [];
          const testResult =
            values.length > 0
              ? { status: 'success', message: 'Data source connected and services found.' }
              : {
                  status: 'error',
                  message:
                    'Data source connected, but no services received. Verify that Jaeger is configured properly.',
                };
          return testResult;
        }),
        catchError((err: any) => {
          let message = 'Jaeger: ';
          if (err.statusText) {
            message += err.statusText;
          } else {
            message += 'Cannot connect to Jaeger';
          }

          if (err.status) {
            message += `. ${err.status}`;
          }

          if (err.data && err.data.message) {
            message += `. ${err.data.message}`;
          } else if (err.data) {
            message += `. ${JSON.stringify(err.data)}`;
          }
          return of({ status: 'error', message: message });
        })
      )
      .toPromise();
  }

  getTimeRange(): { start: number; end: number } {
    const range = this.timeSrv.timeRange();
    return {
      start: getTime(range.from, false),
      end: getTime(range.to, true),
    };
  }

  getQueryDisplayText(query: JaegerQuery) {
    return query.query;
  }

  private _request(apiUrl: string, data?: any, options?: Partial<BackendSrvRequest>): Observable<Record<string, any>> {
    // Hack for proxying metadata requests
    const baseUrl = `/api/datasources/proxy/${this.instanceSettings.id}`;
    const params = data ? serializeParams(data) : '';
    const url = `${baseUrl}${apiUrl}${params.length ? `?${params}` : ''}`;
    const req = {
      ...options,
      url,
    };

    return from(getBackendSrv().datasourceRequest(req));
  }
}

function getTime(date: string | DateTime, roundUp: boolean) {
  if (typeof date === 'string') {
    date = dateMath.parse(date, roundUp)!;
  }
  return date.valueOf() * 1000;
}

const emptyTraceDataFrame = new MutableDataFrame({
  fields: [
    {
      name: 'trace',
      type: FieldType.trace,
      values: [],
    },
  ],
  meta: {
    preferredVisualisationType: 'trace',
  },
});
