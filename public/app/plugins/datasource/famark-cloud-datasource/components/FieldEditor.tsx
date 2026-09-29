import { FieldType, SelectableValue } from '@grafarg/data';
import { Icon, InlineField, InlineFieldRow, Input, Select } from '@grafarg/ui';
import { JsonDataSource } from '../datasource';
import React, { useEffect, useState } from 'react';
import { JsonField, Pair, QueryLanguage } from '../types';
import { fetchAttributeOptions, splitColumnIntoAggAndAttribute } from './BodyQueryBuilder';
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
      return FieldType.string;
    case 'TypeDateTime':
      return FieldType.time;
    case 'TypeTwoOptions':
      return FieldType.boolean;
    case 'TypeLookup':
    case 'TypeOptionSet':
      return undefined;
    default:
      return undefined;
  }
};

/** Parse the Columns string from body JSON */
const parseColumns = (body?: string): string[] => {
  try {
    return String(JSON.parse(body || '{}').Columns ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
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
  const prevKey = React.useRef<string>('');
  const [attributes, setAttributes] = useState<Array<SelectableValue<string>>>([]);
  const [loading, setLoading] = useState(false);
  const isStats = operation === 'RetrieveStats';
  const prefix = operation === 'RetrieveMultipleRecords' ? '$[*].' : '$.';

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

  // ── Auto-fill fields from body columns ──
  useEffect(() => {
    const columns = parseColumns(body);
    if (!columns.length) {
      return;
    }

    // Only re-run when columns or attributes actually change
    const key = columns.join(',') + '|' + attributes.map((a) => `${a.value}:${a.attributeType}`).join(',');
    if (key === prevKey.current) {
      return;
    }
    prevKey.current = key;

    const next = columns.map((col, i) => {
      const existing = value[i];
      const attrName = isStats ? splitColumnIntoAggAndAttribute(col)[1] || col : col;
      const defaultPath = isStats ? '$.Data[*][*]' : `${prefix}${col}`;
      return {
        name: existing?.name ?? '',
        // Preserve user-set path; only use default for new empty fields.
        jsonPath: existing?.jsonPath || defaultPath,
        language: existing?.language ?? 'jsonpath',
        type: existing?.type || toFieldType(getAttrType(attrName)),
      };
    });

    // Preserve any extra fields the user added beyond the column count.
    const extra = value.slice(columns.length);
    const merged = [...next, ...extra];

    const unchanged =
      value.length === merged.length &&
      value.every((f, i) => f.jsonPath === merged[i].jsonPath && f.type === merged[i].type);

    if (!unchanged) {
      onChange(merged);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body, isStats, operation, attributes]); // onChange excluded: stable ref, prevKey handles change detection

  // ── Ensure stats fields have a jsonPath ──
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isStats && value.some((f) => !f.jsonPath)) {
      onChange(value.map((f) => (f.jsonPath ? f : { ...f, jsonPath: '$.Data[*][*]' })));
    }
  }, [isStats, value]); // onChange excluded: stable ref, no need to re-run on ref change

  // ── Field update helpers ──

  const updateField = (i: number, patch: Partial<JsonField>) =>
    onChange(value.map((f, n) => (n === i ? { ...value[i], ...patch } : f)));

  const onPathChange = (i: number) => (path: string) => updateField(i, { jsonPath: path });

  const onLanguageChange = (i: number) => (v: SelectableValue<QueryLanguage>) => updateField(i, { language: v.value });

  const onTypeChange = (i: number) => (v: SelectableValue<string>) =>
    updateField(i, { type: (v.value === 'auto' ? undefined : v.value) as FieldType });

  const onAliasChange = (i: number) => (e: any) => updateField(i, { name: e.currentTarget.value });

  const onAttributeChange = (i: number) => (selected: SelectableValue<string> | null) => {
    const currentPath = value[i]?.jsonPath ?? '';
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
    onChange([...value.slice(0, i + 1), { name: '', jsonPath: '', ...defaults }, ...value.slice(i + 1)]);

  const removeField = (i: number) => () => onChange(value.filter((_, n) => n !== i));

  // ── Render ──

  return (
    <>
      {value.map((field, i) => (
        <InlineFieldRow key={i}>
          {/* Attribute selector — hidden for stats */}
          {!isStats && (
            <InlineField label="Attribute">
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
            tooltip={
              <div>
                A <a href="https://goessner.net/articles/JsonPath/">JSON Path</a> query that selects one or more values
                from a JSON object.
              </div>
            }
            grow
          >
            {field.language === 'jsonata' ? (
              <JsonataQueryField onBlur={() => onChange(value)} onChange={onPathChange(i)} query={field.jsonPath} />
            ) : (
              <JsonPathQueryField
                onBlur={() => onChange(value)}
                onChange={onPathChange(i)}
                query={field.jsonPath}
                onData={onComplete}
              />
            )}
          </InlineField>

          {/* Language selector */}
          <InlineField>
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
          <a className="gf-form-label" onClick={addField(i, { language: field.language ?? 'jsonpath' })}>
            <Icon name="plus" />
          </a>
          <a className="gf-form-label" onClick={removeField(i)}>
            <Icon name="minus" />
          </a>
        </InlineFieldRow>
      ))}
    </>
  );
};
