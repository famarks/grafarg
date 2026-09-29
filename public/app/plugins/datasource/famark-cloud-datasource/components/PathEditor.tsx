import { InlineField, InlineFieldRow, Input, Select } from '@grafarg/ui';
import { JsonDataSource } from '../datasource';
import React, { useEffect, useState } from 'react';
import { Pair } from '../types';

interface Props {
  method: string;
  onMethodChange: (method: string) => void;
  path: string;
  onPathChange: (path: string) => void;
  onEntityIdChange?: (entityId?: string) => void;
  onOperationChange?: (operation?: string) => void;
  datasource: JsonDataSource;
  headers: Array<Pair<string, string>>;
}

const operationOptions = [
  { label: 'RetrieveMultipleRecords', value: 'RetrieveMultipleRecords' },
  { label: 'RetrieveStats', value: 'RetrieveStats' },
  { label: 'RetrieveRecord', value: 'RetrieveRecord' },
];
const defaultOperation = operationOptions[0].value;

const entityPath = '/System_Entity/RetrieveMultipleRecords';
const entityBody = JSON.stringify({ Columns: 'System_EntityId,SystemName' });

type EntityOption = { label: string; value: string; entityId?: string };

const extractEntityNames = (data: any): EntityOption[] =>
  (data || [])
    .map((record: any) => ({
      label: record.SystemName,
      value: record.SystemName,
      entityId: record.System_EntityId,
    }))
    .sort((a: EntityOption, b: EntityOption) => a.label.localeCompare(b.label));

export const PathEditor = ({
  method,
  onMethodChange,
  path,
  onPathChange,
  onEntityIdChange,
  onOperationChange,
  datasource,
  headers,
}: Props) => {
  const [entityOptions, setEntityOptions] = useState<EntityOption[]>([]);
  const [entitiesLoading, setEntitiesLoading] = useState(false);

  const [entity, operation] = path.trim().replace(/^\/+/, '').split('/').filter(Boolean);
  const operationValue = operation || defaultOperation;
  const selectedEntity = entityOptions.find((option) => option.value === entity);
  const selectedOperation = operationOptions.find((option) => option.value === operationValue);
  const selectedEntityId = selectedEntity?.entityId;

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setEntitiesLoading(true);
        const data = await datasource.api.get('POST', entityPath, [], headers, entityBody, { hideFromInspector: true });
        if (!active) {
          return;
        }
        const options = extractEntityNames(data);
        setEntityOptions(options);
      } catch {
        if (active) {
          setEntityOptions([]);
        }
      } finally {
        if (active) {
          setEntitiesLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [datasource, headers]);

  useEffect(() => {
    onEntityIdChange?.(selectedEntityId);
  }, [onEntityIdChange, selectedEntityId]);

  useEffect(() => {
    onOperationChange?.(operationValue);
  }, [onOperationChange, operationValue]);

  useEffect(() => {
    if (!path && entityOptions[0]) {
      onPathChange(`/${entityOptions[0].value}/${defaultOperation}`);
    }
  }, [entityOptions, onPathChange, path]);

  const onEntityChange = (value?: { value?: string }) => {
    const nextEntity = value?.value;
    onPathChange(nextEntity ? `/${nextEntity}/${operationValue}` : '');
  };

  const handleOperationChange = (value?: { value?: string }) => {
    const nextOperation = value?.value ?? defaultOperation;
    onOperationChange?.(nextOperation);
    if (entity) {
      onPathChange(`/${entity}/${nextOperation}`);
    }
  };

  return (
    <>
      <InlineFieldRow>
        <InlineField>
          <Select
            value={method}
            options={[
              { label: 'GET', value: 'GET' },
              { label: 'POST', value: 'POST' },
            ]}
            onChange={(v) => onMethodChange(v.value ?? 'GET')}
          />
        </InlineField>
        <InlineField>
          <Select
            placeholder="Entity"
            isLoading={entitiesLoading}
            isClearable={true}
            value={selectedEntity}
            options={entityOptions}
            onChange={onEntityChange}
          />
        </InlineField>
        <InlineField>
          <Select
            placeholder="Operation"
            value={selectedOperation}
            options={operationOptions}
            onChange={handleOperationChange}
          />
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField grow>
          <Input
            placeholder="/orders/${orderId}"
            value={path}
            onChange={(e) => onPathChange(e.currentTarget.value)}
            readOnly
          />
        </InlineField>
      </InlineFieldRow>
    </>
  );
};
