import _ from 'lodash';
import {
  AnnotationEvent,
  AnnotationQueryRequest,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  LiveChannelScope,
} from '@grafarg/data';

import { GrafargQuery, GrafargAnnotationQuery, GrafargAnnotationType, GrafargQueryType } from './types';
import { getBackendSrv, getTemplateSrv, toDataQueryResponse, getLiveMeasurementsObserver } from '@grafarg/runtime';
import { Observable, of, merge } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

let counter = 100;

export class GrafargDatasource extends DataSourceApi<GrafargQuery> {
  constructor(instanceSettings: DataSourceInstanceSettings) {
    super(instanceSettings);
  }

  query(request: DataQueryRequest<GrafargQuery>): Observable<DataQueryResponse> {
    const queries: Array<Observable<DataQueryResponse>> = [];
    for (const target of request.targets) {
      if (target.hide) {
        continue;
      }
      if (target.queryType === GrafargQueryType.LiveMeasurements) {
        const { channel, measurements } = target;
        if (channel) {
          queries.push(
            getLiveMeasurementsObserver(
              {
                scope: LiveChannelScope.Grafarg,
                namespace: 'measurements',
                path: channel,
              },
              `${request.requestId}.${counter++}`,
              measurements
            )
          );
        }
      } else {
        queries.push(getRandomWalk(request));
      }
    }
    // With a single query just return the results
    if (queries.length === 1) {
      return queries[0];
    }
    if (queries.length > 1) {
      return merge(...queries);
    }
    return of(); // nothing
  }

  metricFindQuery(options: any) {
    return Promise.resolve([]);
  }

  annotationQuery(options: AnnotationQueryRequest<GrafargQuery>): Promise<AnnotationEvent[]> {
    const templateSrv = getTemplateSrv();
    const annotation = (options.annotation as unknown) as GrafargAnnotationQuery;
    const params: any = {
      from: options.range.from.valueOf(),
      to: options.range.to.valueOf(),
      limit: annotation.limit,
      tags: annotation.tags,
      matchAny: annotation.matchAny,
    };

    if (annotation.type === GrafargAnnotationType.Dashboard) {
      // if no dashboard id yet return
      if (!options.dashboard.id) {
        return Promise.resolve([]);
      }
      // filter by dashboard id
      params.dashboardId = options.dashboard.id;
      // remove tags filter if any
      delete params.tags;
    } else {
      // require at least one tag
      if (!Array.isArray(annotation.tags) || annotation.tags.length === 0) {
        return Promise.resolve([]);
      }
      const delimiter = '__delimiter__';
      const tags = [];
      for (const t of params.tags) {
        const renderedValues = templateSrv.replace(t, {}, (value: any) => {
          if (typeof value === 'string') {
            return value;
          }

          return value.join(delimiter);
        });
        for (const tt of renderedValues.split(delimiter)) {
          tags.push(tt);
        }
      }
      params.tags = tags;
    }

    return getBackendSrv().get(
      '/api/annotations',
      params,
      `grafarg-data-source-annotations-${annotation.name}-${options.dashboard?.id}`
    );
  }

  testDatasource() {
    return Promise.resolve();
  }
}

// Note that the query does not actually matter
function getRandomWalk(request: DataQueryRequest): Observable<DataQueryResponse> {
  const { intervalMs, maxDataPoints, range, requestId } = request;

  // Yes, this implementation ignores multiple targets!  But that matches existing behavior
  const params: Record<string, any> = {
    intervalMs,
    maxDataPoints,
    from: range.from.valueOf(),
    to: range.to.valueOf(),
  };

  return getBackendSrv()
    .fetch({
      url: '/api/tsdb/testdata/random-walk',
      method: 'GET',
      params,
      requestId,
    })
    .pipe(
      map((rsp: any) => {
        return toDataQueryResponse(rsp);
      }),
      catchError((err) => {
        return of(toDataQueryResponse(err));
      })
    );
}
