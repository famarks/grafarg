import {
  ArrayVector,
  DataFrame,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  Field,
  MetricFindValue,
  ScopedVars,
  TimeRange,
  toDataFrame,
} from '@grafarg/data';
import { getBackendSrv, getTemplateSrv } from '@grafarg/runtime';
import jsonata from 'jsonata';
import { JSONPath } from 'jsonpath-plus';
import { jp } from './jsonpath';
import _ from 'lodash';
import API from './api';
import { detectFieldType } from './detectFieldType';
import { parseValues } from './parseValues';
import { JsonApiDataSourceOptions, JsonApiQuery, Pair } from './types';
import { trackRequest } from './tracking';

let sessionPassword = '';
let sessionListener: ((payload?: any) => void) | null = null;
export const setSessionPassword = (pwd: string) => {
  sessionPassword = pwd;
};
export const setSessionListener = (fn: ((payload?: any) => void) | null) => {
  sessionListener = fn;
};
export const notifySessionUpdate = (payload?: any) => {
  sessionListener?.(payload);
};

export class JsonDataSource extends DataSourceApi<JsonApiQuery, JsonApiDataSourceOptions> {
  api: API;
  instanceSettings: DataSourceInstanceSettings<JsonApiDataSourceOptions>;

  constructor(instanceSettings: DataSourceInstanceSettings<JsonApiDataSourceOptions>) {
    super(instanceSettings);
    this.instanceSettings = instanceSettings;
    this.api = new API(instanceSettings.url!, instanceSettings.jsonData.queryParams || '');
  }

  /**
   * metadataRequest is used by the language provider to return the JSON
   * document to generate suggestions for the QueryField.
   */
  async metadataRequest(query: JsonApiQuery, range?: TimeRange) {
    return this.requestJson(query, replace({}, range));
  }

  async query(request: DataQueryRequest<JsonApiQuery>): Promise<DataQueryResponse> {
    trackRequest(request);

    const promises = await request.targets
      .filter((query: JsonApiQuery) => !query.hide)
      .flatMap((query: JsonApiQuery) => this.doRequest(query, request.range, request.scopedVars));

    const res: DataFrame[][] = await Promise.all(promises);

    return { data: res.flatMap((frames) => frames) };
  }

  /**
   * Returns values for a Query variable.
   */
  async metricFindQuery?(query: JsonApiQuery, options: Record<string, any>): Promise<MetricFindValue[]> {
    const frames = await this.doRequest(query, options.range);
    const frame = frames[0];

    if (!frame.fields.length) {
      return [];
    }

    const labelField =
      frame.fields.find((field) => field.name === query.experimentalVariableTextField) ?? frame.fields[0];
    const valueField = frame.fields.find((field) => field.name === query.experimentalVariableValueField) ?? labelField;

    return Array.from({ length: frame.length }).map((_, idx) => ({
      text: labelField.values.get(idx),
      value: valueField.values.get(idx),
    }));
  }

  /**
   * This line adds support for annotation queries in >=7.2.
   */
  annotations = {};

  /**
   * Checks whether we can connect to the API.
   */
  async testDatasource() {
    const jd = this.instanceSettings.jsonData as any;
    const authMode = jd.authMode ?? (jd.credUsername || jd.httpHeaderName1 ? 'userpass' : 'oauth');
    const domain = (jd.domainName ?? '').trim();
    const username = (jd.credUsername ?? '').trim();
    const password = sessionPassword?.trim();
    const hasSavedSecret = Boolean(
      jd.httpHeaderName1 ||
        (this.instanceSettings as any).secureJsonFields?.httpHeaderValue1 ||
        (this.instanceSettings as any).secureJsonFields?.password
    );

    // Validate required fields
    const missing = [
      !domain && 'Domain Name',
      authMode === 'userpass' && !username && 'Username',
      authMode === 'userpass' && !password && !hasSavedSecret && 'Password',
    ].filter(Boolean);

    if (missing.length > 0) {
      return {
        status: 'error',
        message: `${missing.join(missing.length === 2 ? ' and ' : ', ')} ${missing.length > 1 ? 'are' : 'is'} required`,
      };
    }

    const isUserPassAuth = authMode === 'userpass' && Boolean(password);

    try {
      const body = { DomainName: domain, ...(isUserPassAuth ? { UserName: username, Password: password } : {}) };
      const res = await new API(`/api/datasources/proxy/${this.id}`, '').get(
        'POST',
        '/Credential/Connect',
        [],
        [['Content-Type', 'application/json']],
        JSON.stringify(body),
        { hideFromInspector: true }
      );

      if (res?.ErrorMessage) {
        return {
          status: 'error',
          message: res.ErrorMessage,
        };
      }

      // In userpass mode with new password, save SessionId as custom HTTP header
      if (isUserPassAuth) {
        const sessionId = (typeof res === 'string' ? res.replace(/^"|"$/g, '') : res)?.trim?.();
        if (sessionId) {
          const currentDs = await getBackendSrv().get(`/api/datasources/${this.id}`);
          const saved = await getBackendSrv().put(`/api/datasources/${this.id}`, {
            ...currentDs,
            jsonData: { ...currentDs.jsonData, httpHeaderName1: 'SessionId' },
            secureJsonData: { ...(currentDs.secureJsonData ?? {}), httpHeaderValue1: sessionId },
          });
          this.instanceSettings = { ...this.instanceSettings, ...(saved?.datasource ?? {}) };
          sessionPassword = '';
          notifySessionUpdate(saved?.datasource ?? (currentDs.version ? currentDs.version + 1 : undefined));

          return {
            status: 'success',
            message: 'Authenticated & Connected to Famark Cloud!',
          };
        }
      }

      return {
        status: 'success',
        message: authMode === 'oauth' ? 'Domain verified & Connected to Famark Cloud!' : 'Connected to Famark Cloud!',
      };
    } catch (authErr) {
      const err = authErr as any;
      const errMsg =
        err?.data?.ErrorMessage ?? err?.data?.Message ?? err?.statusText ?? err?.message ?? 'Connection failed';
      return {
        status: 'error',
        message: errMsg,
      };
    }
  }

  async doRequest(query: JsonApiQuery, range?: TimeRange, scopedVars?: ScopedVars): Promise<DataFrame[]> {
    const replaceWithVars = replace(scopedVars, range);

    const json = await this.requestJson(query, replaceWithVars);

    if (!json) {
      throw new Error('Query returned empty data');
    }

    const fields: Field[] = (query.fields ?? [])
      .filter((field) => field.jsonPath)
      .map((field, index) => {
        switch (field.language) {
          case 'jsonata':
            const expression = jsonata(field.jsonPath);

            const bindings: Record<string, any> = {};

            getTemplateSrv()
              .getVariables()
              .map((v) => ({ name: v.name, value: getVariable(v.name) }))
              .forEach((v) => {
                bindings[v.name] = v.value;
              });

            globalVariables
              .map((v) => ({ name: v, value: getVariable(v) }))
              .forEach((v) => {
                bindings[v.name] = v.value;
              });

            if (range) {
              bindings['__unixEpochFrom'] = range.from.valueOf();
              bindings['__unixEpochTo'] = range.to.valueOf();
              bindings['__isoFrom'] = range.from.toISOString();
              bindings['__isoTo'] = range.to.toISOString();
            }

            const result = expression.evaluate(json, bindings);
            const arrayResult = Array.isArray(result) ? result : [result];

            return {
              name: replaceWithVars(field.name ?? '') || (query.fields.length > 1 ? `result${index}` : 'result'),
              type: field.type ? field.type : detectFieldType(arrayResult),
              values: new ArrayVector(arrayResult),
              config: {},
            };
          default:
            const path = replaceWithVars(field.jsonPath);
            const values = jp({ path, json });

            const paths = (JSONPath as any).toPathArray(path);
            const propertyType = field.type ? field.type : detectFieldType(values);
            const typedValues = parseValues(values, propertyType);

            return {
              name: replaceWithVars(field.name ?? '') || paths[paths.length - 1],
              type: propertyType,
              values: new ArrayVector(typedValues),
              config: {},
            };
        }
      });

    const fieldLengths = fields.map((field) => field.values.length);
    const uniqueFieldLengths = Array.from(new Set(fieldLengths)).length;

    if (uniqueFieldLengths > 1) {
      throw new Error('Fields have different lengths');
    }

    const frames = query.experimentalGroupByField
      ? groupBy(
          toDataFrame({
            name: query.refId,
            refId: query.refId,
            fields: fields,
          }),
          query.experimentalGroupByField
        )
      : [
          toDataFrame({
            name: query.refId,
            refId: query.refId,
            fields: fields,
          }),
        ];

    const res = frames.map((frame) => ({
      ...frame,
      fields: frame.fields.map(
        (field: Field): Field =>
          field.name === query.experimentalMetricField ? { ...field, config: { displayNameFromDS: frame.name } } : field
      ),
    }));

    return res;
  }

  async requestJson(query: JsonApiQuery, interpolate: (text: string) => string) {
    const interpolateKeyValue = ([key, value]: Pair<string, string>): Pair<string, string> => {
      return [interpolate(key), interpolate(value)];
    };

    // All auth modes (OAuth Forwarding, User/Password) now work
    // through the Grafarg proxy. The SessionId header is stored as a custom HTTP
    // header (httpHeaderName1/httpHeaderValue1) and injected automatically by the
    // proxy transport layer. No client-side header injection needed.
    return await this.api.cachedGet(
      query.cacheDurationSeconds,
      query.method,
      interpolate(query.urlPath),
      (query.params ?? []).map(interpolateKeyValue),
      (query.headers ?? []).map(interpolateKeyValue),
      interpolate(query.body)
    );
  }
}

const replace = (scopedVars?: any, range?: TimeRange) => (str: string): string => {
  return replaceMacros(getTemplateSrv().replace(str, scopedVars), range);
};

export const replaceMacros = (str: string, range?: TimeRange) => {
  return range
    ? str
        .replace(/\(\)/g, range.from.unix().toString())
        .replace(/\(\)/g, range.to.unix().toString())
        .replace(/\(\)/g, range.from.toISOString())
        .replace(/\(\)/g, range.to.toISOString())
    : str;
};

export const groupBy = (frame: DataFrame, fieldName: string): DataFrame[] => {
  const groupByField = frame.fields.find((field) => field.name === fieldName);
  if (!groupByField) {
    return [frame];
  }

  const uniqueValues = new Set(groupByField.values.toArray());

  const frames = [...uniqueValues].map((groupByValue) => {
    const fields: Field[] = frame.fields
      .filter((field) => field.name.toString() !== groupByField.name)
      .map((field) => ({
        ...field,
        values: new ArrayVector(
          field.values.toArray().filter((_, idx) => {
            return groupByField.values.get(idx) === groupByValue;
          })
        ),
      }));

    return toDataFrame({
      name: groupByValue,
      refId: frame.refId,
      fields,
    });
  });

  return frames;
};

const getVariable = (name: any): string[] => {
  const values: string[] = [];

  getTemplateSrv().replace(`$${name}`, {}, (value: string | string[]) => {
    if (Array.isArray(value)) {
      values.push(...value);
    } else {
      values.push(value);
    }
    return '';
  });

  return values;
};

const globalVariables: string[] = [
  '__dashboard',
  '__from',
  '__to',
  '__interval',
  '__interval_ms',
  '__name',
  '__org',
  '__user',
  '__range',
  '__rate_interval',
  'timeFilter',
  '__timeFilter',
];
