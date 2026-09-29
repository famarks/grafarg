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
import { getTemplateSrv } from '@grafarg/runtime';
import jsonata from 'jsonata';
import { JSONPath } from 'jsonpath-plus';
import { jp } from './jsonpath';
import _ from 'lodash';
import API from './api';
import { detectFieldType } from './detectFieldType';
import { parseValues } from './parseValues';
import { JsonApiDataSourceOptions, JsonApiQuery, Pair } from './types';
import { trackRequest } from './tracking';

export class JsonDataSource extends DataSourceApi<JsonApiQuery, JsonApiDataSourceOptions> {
  api: API;

  constructor(instanceSettings: DataSourceInstanceSettings<JsonApiDataSourceOptions>) {
    super(instanceSettings);
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
    const defaultErrorMessage = 'Cannot connect to API';

    try {
      const response = await this.api.test();

      if (response.status === 200) {
        return {
          status: 'success',
          message: 'Success',
        };
      } else {
        return {
          status: 'error',
          message: response.statusText ? response.statusText : defaultErrorMessage,
        };
      }
    } catch (err) {
      const e = err as any;
      if (_.isString(e)) {
        return {
          status: 'error',
          message: e,
        };
      } else {
        let message = 'Famark JSON API: ';
        message += e.statusText ? e.statusText : defaultErrorMessage;
        if (e.data && e.data.error && e.data.error.code) {
          message += ': ' + e.data.error.code + '. ' + e.data.error.message;
        }

        return {
          status: 'error',
          message,
        };
      }
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
