import { FieldType, SelectableValue } from '@grafarg/data';
import { Icon, InlineField, InlineFieldRow, Input, Select } from '@grafarg/ui';
import { JsonDataSource } from '../datasource';
import React, { useEffect, useState } from 'react';
import { JsonField, Pair, QueryLanguage } from '../types';
import { fetchAttributeOptions } from './BodyQueryBuilder';
import { JsonataQueryField } from './JsonataQueryField';
import { JsonPathQueryField } from './JsonPathQueryField';

// ── Constants ──

const LANGUAGE_OPTIONS = [
  { label: 'JSONPath', value: 'jsonpath' as QueryLanguage },
  { label: 'JSONata', value: 'jsonata' as QueryLanguage },
];

const TYPE_OPTIONS = [
  { label: 'Auto', value: 'auto' },
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Time', value: 'time' },
  { label: 'Boolean', value: 'boolean' },
];

// ── Helpers ──

/** Map API attribute type to Grafarg field type */
const toFieldType = (attrType?: string): FieldType | undefined => {
  switch (attrType) {
    case 'TypeCurrency':
    case 'TypeDecimalNumber':
    case 'TypeFloatingNumber':
    case 'TypeWholeNumber':
      return FieldType.number;
    case 'TypeSingleLine':
    case 'TypeMultipleLine':
    case 'TypeOptionSet':
    case 'TypeLookup':
      return FieldType.string;
    case 'TypeDateTime':
      return FieldType.time;
    case 'TypeTwoOptions':
      return FieldType.boolean;
    default:
      return undefined;
  }
};

/** Parse body JSON to get Columns, GroupBy, and DateTimePart */
export const parseBodyFields = (body?: string) => {
  if (!body || !body.trim()) {
    return { columns: [] as string[], groupBy: '', dateTimePart: '', isValid: true };
  }
  try {
    const obj = JSON.parse(body);
    const columns = String(obj.Columns ?? '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    return {
      columns,
      groupBy: String(obj.GroupBy ?? '').trim(),
      dateTimePart: String(obj.DateTimePart ?? '').trim(),
      isValid: true,
    };
  } catch {
    return { columns: [] as string[], groupBy: '', dateTimePart: '', isValid: false };
  }
};

/** Auto-generate fields matching the Famark response schema for body columns */
export const EMPTY_FIELD: JsonField = { name: '', jsonPath: '', language: 'jsonpath' };

export const syncFieldsFromBody = (
  body?: string,
  operation?: string,
  existingFields: JsonField[] = [],
  attributes: Array<SelectableValue<string>> = [],
  previousBody?: string
): JsonField[] => {
  const { columns, groupBy, dateTimePart, isValid } = parseBodyFields(body);
  if (!isValid || (!columns.length && !groupBy)) {
    return [EMPTY_FIELD];
  }

  const isStats = operation === 'RetrieveStats';
  const prefix = operation === 'RetrieveMultipleRecords' ? '$[*].' : '$.';
  const getAttrType = (name?: string) => attributes.find((a) => a.value === name)?.attributeType as string | undefined;

  if (isStats) {
    const fields: JsonField[] = [];
    const prevParsed = parseBodyFields(previousBody);
    const oldLayout = [...(prevParsed.groupBy ? [prevParsed.groupBy] : []), ...prevParsed.columns];
    const findExisting = (name: string) =>
      existingFields.find((f) => f.jsonPath === `$.Data[*][${oldLayout.indexOf(name)}]`);

    if (groupBy) {
      const metaType = toFieldType(getAttrType(groupBy));
      const groupType = dateTimePart ? FieldType.time : metaType;
      const existing = findExisting(groupBy);
      fields.push({
        name: existing?.name || groupBy,
        jsonPath: '$.Data[*][0]',
        language: 'jsonpath',
        type: existing?.type || groupType,
      });
    }

    columns.forEach((col, i) => {
      const existing = findExisting(col);
      fields.push({
        name: existing?.name || col,
        jsonPath: `$.Data[*][${groupBy ? i + 1 : i}]`,
        language: 'jsonpath',
        type: existing?.type || FieldType.number,
      });
    });

    return fields;
  }

  // RetrieveMultipleRecords: $[*].col | RetrieveRecord: $.col
  return columns.map((col) => {
    const path = `${prefix}${col}`;
    const existing = existingFields.find((f) => f.jsonPath === path);
    return {
      name: existing?.name || col,
      jsonPath: path,
      language: (existing?.language ?? 'jsonpath') as QueryLanguage,
      type: existing?.type || toFieldType(getAttrType(col)),
    };
  });
};

/** Find the last attribute name in a JSONPath like "$[*].SomeName" */
const findAttribute = (path: string, options: Array<SelectableValue<string>>) => {
  let bestIndex = -1;
  let bestValue = '';
  for (const opt of options) {
    const v = opt.value ?? '';
    const idx = v ? path.lastIndexOf(`.${v}`) : -1;
    if (idx > bestIndex) {
      bestIndex = idx;
      bestValue = v;
    }
  }
  return bestIndex >= 0 ? { index: bestIndex, value: bestValue } : undefined;
};

// ── Component ──

interface Props {
  datasource: JsonDataSource;
  entityId?: string;
  operation?: string;
  headers: Array<Pair<string, string>>;
  limit?: number;
  onChange: (value: JsonField[]) => void;
  onComplete: () => Promise<any>;
  value: JsonField[];
  body?: string;
}

export const FieldEditor = ({
  value = [],
  onChange,
  limit,
  onComplete,
  datasource,
  headers,
  entityId,
  operation,
  body,
}: Props) => {
  const [attributes, setAttributes] = useState<Array<SelectableValue<string>>>([]);
  const [loading, setLoading] = useState(false);
  const isStats = operation === 'RetrieveStats';
  const prefix = operation === 'RetrieveMultipleRecords' ? '$[*].' : '$.';
  // Ensure there is always at least one empty field row so the user can manually add/edit fields
  const fields: JsonField[] = value && value.length > 0 ? value : [EMPTY_FIELD];

  /** Get attribute type by name */
  const getAttrType = (name?: string) => attributes.find((a) => a.value === name)?.attributeType as string | undefined;

  // ── Fetch attributes when entity changes ──
  useEffect(() => {
    if (!entityId) {
      setAttributes([]);
      return;
    }
    setLoading(true);
    fetchAttributeOptions(datasource, headers, entityId)
      .then(setAttributes)
      .catch(() => setAttributes([]))
      .finally(() => setLoading(false));
  }, [datasource, entityId, headers]);

  // Auto-fill if empty
  useEffect(() => {
    if (!value || value.length === 0) {
      const next = syncFieldsFromBody(body, operation, value, attributes);
      onChange(next.length > 0 && next[0]?.jsonPath ? next : [EMPTY_FIELD]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body, operation, attributes]);

  // ── Field update helpers ──

  const updateField = (i: number, patch: Partial<JsonField>) =>
    onChange(fields.map((f, n) => (n === i ? { ...fields[i], ...patch } : f)));

  const onPathChange = (i: number) => (path: string) => updateField(i, { jsonPath: path });

  const onLanguageChange = (i: number) => (v: SelectableValue<QueryLanguage>) => updateField(i, { language: v.value });

  const onTypeChange = (i: number) => (v: SelectableValue<string>) =>
    updateField(i, { type: (v.value === 'auto' ? undefined : v.value) as FieldType });

  const onAliasChange = (i: number) => (e: any) => updateField(i, { name: e.currentTarget.value });

  const onAttributeChange = (i: number) => (selected: SelectableValue<string> | null) => {
    const currentPath = fields[i]?.jsonPath ?? '';
    const found = findAttribute(currentPath, attributes);

    let nextPath: string;
    if (selected?.value) {
      // Replace existing attribute or append new one
      if (found) {
        nextPath =
          currentPath.slice(0, found.index + 1) +
          selected.value +
          currentPath.slice(found.index + 1 + found.value.length);
      } else {
        nextPath =
          (currentPath ? (currentPath.endsWith('.') ? currentPath : `${currentPath}.`) : prefix) + selected.value;
      }
    } else {
      // Clear the attribute
      nextPath = found
        ? currentPath.slice(0, found.index) + currentPath.slice(found.index + 1 + found.value.length)
        : currentPath;
    }

    const mappedType = selected?.value ? toFieldType(getAttrType(selected.value)) : undefined;
    updateField(i, { jsonPath: nextPath, type: mappedType });
  };

  const addField = (i: number, defaults?: { language: QueryLanguage }) => () =>
    onChange([...fields.slice(0, i + 1), { name: '', jsonPath: '', ...defaults }, ...fields.slice(i + 1)]);

  const removeField = (i: number) => () => {
    if (fields.length <= 1) {
      // Don't totally remove the last field - leave an empty field so the user can manually add/edit
      onChange([EMPTY_FIELD]);
    } else {
      onChange(fields.filter((_, n) => n !== i));
    }
  };

  // ── Render ──

  return (
    <>
      {fields.map((field, i) => (
        <InlineFieldRow key={i}>
          {/* Attribute selector — hidden for stats */}
          {!isStats && (
            <InlineField label="Attribute" disabled>
              <Select
                placeholder="Attribute"
                isLoading={loading}
                isClearable
                value={
                  findAttribute(field.jsonPath ?? '', attributes)
                    ? attributes.find((a) => a.value === findAttribute(field.jsonPath ?? '', attributes)?.value)
                    : undefined
                }
                width={20}
                options={attributes}
                onChange={onAttributeChange(i)}
              />
            </InlineField>
          )}

          {/* JSONPath / JSONata editor */}
          <InlineField
            disabled
            tooltip={
              <div>
                A <a href="https://goessner.net/articles/JsonPath/">JSON Path</a> query that selects one or more values
                from a JSON object.
              </div>
            }
            grow
          >
            {field.language === 'jsonata' ? (
              <JsonataQueryField
                disabled={true}
                onBlur={() => onChange(fields)}
                onChange={onPathChange(i)}
                query={field.jsonPath}
              />
            ) : (
              <JsonPathQueryField
                disabled={true}
                onBlur={() => onChange(fields)}
                onChange={onPathChange(i)}
                query={field.jsonPath}
                onData={onComplete}
              />
            )}
          </InlineField>

          {/* Language selector */}
          <InlineField disabled>
            <Select
              value={field.language ?? 'jsonpath'}
              width={14}
              onChange={onLanguageChange(i)}
              options={LANGUAGE_OPTIONS}
            />
          </InlineField>

          {/* Type selector */}
          <InlineField label="Type" tooltip="If Auto is set, the JSON property type is used to detect the field type.">
            <Select value={field.type ?? 'auto'} width={12} onChange={onTypeChange(i)} options={TYPE_OPTIONS} />
          </InlineField>

          {/* Alias */}
          <InlineField label="Alias" tooltip="If left blank, the field uses the name of the queried element.">
            <Input width={12} value={field.name} onChange={onAliasChange(i)} />
          </InlineField>

          {/* Add / Remove */}
          <a className="gf-form-label" hidden onClick={addField(i, { language: field.language ?? 'jsonpath' })}>
            <Icon name="plus" />
          </a>
          <a className="gf-form-label" hidden onClick={removeField(i)}>
            <Icon name="minus" />
          </a>
        </InlineFieldRow>
      ))}
    </>
  );
};
