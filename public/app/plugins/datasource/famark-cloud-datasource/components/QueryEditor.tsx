import { QueryEditorProps } from '@grafarg/data';
import { JsonDataSource } from '../datasource';
import React from 'react';
import { JsonApiDataSourceOptions, JsonApiQuery } from '../types';
import { ExperimentalEditor } from './ExperimentalEditor';
import { FieldEditor } from './FieldEditor';
import { TabbedQueryEditor } from './TabbedQueryEditor';

interface Props extends QueryEditorProps<JsonDataSource, JsonApiQuery, JsonApiDataSourceOptions> {
  limitFields?: number;
  editorContext?: string;
}

export const QueryEditor: React.FC<Props> = (props) => {
  const { query, editorContext, onChange, onRunQuery } = props;
  const [entityId, setEntityId] = React.useState<string | undefined>(undefined);
  const [operation, setOperation] = React.useState<string | undefined>(undefined);

  return (
    <TabbedQueryEditor
      {...props}
      editorContext={editorContext || 'default'}
      entityId={entityId}
      operation={operation}
      onEntityIdChange={setEntityId}
      onOperationChange={setOperation}
      fieldsTab={
        <FieldEditor
          value={query.fields}
          onChange={(value) => {
            onChange({ ...query, fields: value });
            onRunQuery();
          }}
          limit={props.limitFields}
          onComplete={() => props.datasource.metadataRequest(props.query, props.range)}
          datasource={props.datasource}
          headers={query.headers ?? []}
          entityId={entityId}
          operation={operation}
          body={query.body}
        />
      }
      experimentalTab={
        <ExperimentalEditor
          query={query}
          onChange={onChange}
          onRunQuery={onRunQuery}
          editorContext={editorContext || 'default'}
        />
      }
    />
  );
};
