import { AnnotationQuery, DataQuery } from '@grafana/data';
import { MeasurementsQuery } from '@grafana/runtime';

//----------------------------------------------
// Query
//----------------------------------------------

export enum GrafargQueryType {
  RandomWalk = 'randomWalk',
  LiveMeasurements = 'measurements',
}

export interface GrafargQuery extends DataQuery {
  queryType: GrafargQueryType; // RandomWalk by default
  channel?: string;
  measurements?: MeasurementsQuery;
}

export const defaultQuery: GrafargQuery = {
  refId: 'A',
  queryType: GrafargQueryType.RandomWalk,
};

//----------------------------------------------
// Annotations
//----------------------------------------------

export enum GrafargAnnotationType {
  Dashboard = 'dashboard',
  Tags = 'tags',
}

export interface GrafargAnnotationQuery extends AnnotationQuery<GrafargQuery> {
  type: GrafargAnnotationType; // tags
  limit: number; // 100
  tags?: string[];
  matchAny?: boolean; // By default Grafarg only shows annotations that match all tags in the query. Enabling this returns annotations that match any of the tags in the query.
}
