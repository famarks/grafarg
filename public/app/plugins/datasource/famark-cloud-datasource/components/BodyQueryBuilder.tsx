import { SelectableValue } from '@grafarg/data';
import { Icon, InlineField, InlineFieldRow, Input, Select, useTheme } from '@grafarg/ui';
import { JsonDataSource } from '../datasource';
import { css } from 'emotion';
import React, { useEffect, useState } from 'react';
import { Pair } from '../types';

// ── Constants ──

const ATTRIBUTE_PATH = '/System_Attribute/RetrieveMultipleRecords';
const AGGREGATIONS = ['Get_Count', 'Get_Sum', 'Get_Avg', 'Get_StdDev', 'Get_Max', 'Get_Min'];
const AGGREGATION_OPTIONS = AGGREGATIONS.map((a) => ({ label: `${a}_`, value: a }));

const CONDITION_LABELS = [
  'Equal',
  'GreaterThan',
  'LessThan',
  'GreaterThanEqual',
  'LessThanEqual',
  'In',
  'Between',
  'IsNull',
  'On',
  'OnOrBefore',
  'OnOrAfter',
  'ChildOf',
  'Contains',
  'BeginsWith',
  'EndsWith',
  'IsTrue',
  'IsFalse',
];
const CONDITION_OPTIONS: Array<SelectableValue<number>> = CONDITION_LABELS.map((label, i) => ({ label, value: i }));

const TIMESERIES_OPERATOR = 17;
const TIMESERIES_FROM = '${__from:date:iso}';
const TIMESERIES_TO = '${__to:date:iso}';
const DATE_TIME_PARTS = ['Date', 'Time', 'Day', 'Month', 'Year'].map((v) => ({ label: v, value: v }));

// ── Helpers ──

/** Split "Get_Sum_Revenue" → ["Get_Sum", "Revenue"], or "Revenue" → ["", "Revenue"] */
export const splitColumnIntoAggAndAttribute = (column: string): [string, string] => {
  const agg = AGGREGATIONS.find((a) => column.startsWith(a + '_'));
  if (agg) {
    return [agg, column.slice(agg.length + 1)];
  }
  return AGGREGATIONS.includes(column) ? [column, ''] : ['', column];
};

/** Build a column string from aggregation + attribute */
const buildColumn = (agg: string, attr: string) => {
  if (agg && attr) {
    return `${agg}_${attr}`;
  }
  return agg || attr;
};

/** Check if a condition represents a timeseries filter */
const isTimeseries = (c: any) =>
  c.Operator === 6 && c.Values?.[0] === TIMESERIES_FROM && c.Values?.[1] === TIMESERIES_TO;

/** Parse body JSON string into structured parts */
const parseBody = (body: string) => {
  try {
    const obj = JSON.parse(body || '{}');
    const columns = String(obj.Columns ?? '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    return {
      columns,
      orderBy: String(obj.OrderBy ?? '').trim(),
      groupBy: String(obj.GroupBy ?? '').trim(),
      dateTimePart: String(obj.DateTimePart ?? ''),
      dateTimeInterval: String(obj.DateTimeInterval ?? ''),
      filter: obj.Filter,
    };
  } catch {
    return {
      columns: [] as string[],
      orderBy: '',
      groupBy: '',
      dateTimePart: '',
      dateTimeInterval: '',
      filter: undefined as any,
    };
  }
};

/** Fetch entity attributes from the API */
export const fetchAttributeOptions = async (
  datasource: JsonDataSource,
  headers: Array<Pair<string, string>>,
  entityId: string
): Promise<Array<SelectableValue<string>>> => {
  const body = JSON.stringify({
    Columns: 'SystemName, AttributeType',
    Filter: {
      Operator: 0,
      Conditions: [{ FieldName: 'EntityId', Operator: 0, ServerValue: 0, Values: [entityId], IsNot: false }],
    },
    OrderBy: 'SystemName',
  });
  const records = await datasource.api.get('POST', ATTRIBUTE_PATH, [], headers, body);
  return records.map((r: any) => ({ label: r.SystemName, value: r.SystemName, attributeType: r.AttributeType }));
};

/** Get condition dropdown options, adding Timeseries when attribute is DateTime */
const getConditionOptions = (attrType?: string) => {
  const options = [...CONDITION_OPTIONS];
  if (attrType === 'TypeDateTime') {
    options.push({ label: 'Timeseries', value: TIMESERIES_OPERATOR });
  }
  return options;
};

// ── Value Inputs Component ──

interface ValueInputsProps {
  operator: number;
  values: string[];
  onChange: (v: string[]) => void;
}

const ValueInputs: React.FC<ValueInputsProps> = ({ operator, values, onChange }) => {
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);

  // Timeseries — read-only from/to
  if (operator === TIMESERIES_OPERATOR) {
    return (
      <>
        <Input width={20} value={TIMESERIES_FROM} disabled />
        <Input width={20} value={TIMESERIES_TO} disabled />
      </>
    );
  }

  // Between — two inputs
  if (operator === 6) {
    return (
      <>
        <Input
          width={14}
          placeholder="Value 1"
          value={values[0] || ''}
          onChange={(e) => onChange([e.currentTarget.value, values[1] || ''])}
        />
        <Input
          width={14}
          placeholder="Value 2"
          value={values[1] || ''}
          onChange={(e) => onChange([values[0] || '', e.currentTarget.value])}
        />
      </>
    );
  }

  // In — dynamic list of inputs
  if (operator === 5) {
    return (
      <>
        {values.map((val, i) => (
          <React.Fragment key={i}>
            <Input
              width={12}
              value={val}
              placeholder={`Value ${i + 1}`}
              onChange={(e) => {
                const updated = [...values];
                updated[i] = e.currentTarget.value;
                onChange(updated);
                setRemoveIndex(null);
              }}
              onDoubleClick={() => values.length > 1 && setRemoveIndex(removeIndex === i ? null : i)}
            />
            {removeIndex === i && (
              <div
                className="gf-form-label"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  onChange(values.filter((_, j) => j !== i));
                  setRemoveIndex(null);
                }}
              >
                Remove
              </div>
            )}
          </React.Fragment>
        ))}
        <Icon name="plus" onClick={() => onChange([...values, ''])} style={{ cursor: 'pointer' }} />
      </>
    );
  }

  // Default — single input
  return (
    <Input width={20} placeholder="Value" value={values[0] || ''} onChange={(e) => onChange([e.currentTarget.value])} />
  );
};

// ── Main Component ──

interface Props {
  datasource: JsonDataSource;
  entityId?: string;
  headers: Array<Pair<string, string>>;
  body: string;
  onBodyChange: (body: string) => void;
  operation?: string;
}

export const BodyQueryBuilder: React.FC<Props> = ({ datasource, entityId, headers, body, onBodyChange, operation }) => {
  const theme = useTheme();
  const isStats = operation === 'RetrieveStats';

  // State
  const [columns, setColumns] = useState<string[]>(['']);
  const [orderBy, setOrderBy] = useState('');
  const [dateTimePart, setDateTimePart] = useState('');
  const [dateTimeInterval, setDateTimeInterval] = useState('');
  const [attributes, setAttributes] = useState<Array<SelectableValue<string>>>([]);
  const [loadingAttrs, setLoadingAttrs] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // New condition form
  const [newAttr, setNewAttr] = useState('');
  const [newOperator, setNewOperator] = useState(0);
  const [newValues, setNewValues] = useState<string[]>(['']);
  const [newIsNot, setNewIsNot] = useState(false);
  const [formKey, setFormKey] = useState(0);

  // ── Sync state from body prop ──
  useEffect(() => {
    const parsed = parseBody(body);
    setColumns(parsed.columns.length ? parsed.columns : ['']);
    setOrderBy(isStats ? parsed.groupBy : parsed.orderBy);
    setDateTimePart(parsed.dateTimePart);
    setDateTimeInterval(parsed.dateTimeInterval);
    if (parsed.filter?.Conditions?.length > 0) {
      setFilterOpen(true);
    }
  }, [body, isStats]);

  // ── Fetch attributes when entity changes ──
  useEffect(() => {
    if (!entityId) {
      setAttributes([]);
      return;
    }
    setLoadingAttrs(true);
    fetchAttributeOptions(datasource, headers, entityId)
      .then(setAttributes)
      .catch(() => setAttributes([]))
      .finally(() => setLoadingAttrs(false));
  }, [datasource, entityId, headers]);

  // ── Current filter conditions from body ──
  const conditions: any[] = parseBody(body).filter?.Conditions ?? [];

  // ── Save Helpers ──

  /** Save columns, orderBy, and dateTime fields to body JSON */
  const saveColumns = (cols: string[], order: string, dtPart = dateTimePart, dtInterval = dateTimeInterval) => {
    let obj: any = {};
    try {
      obj = JSON.parse(body || '{}');
    } catch {}

    obj.Columns = cols.filter(Boolean).join(', ') || undefined;

    if (isStats) {
      obj.GroupBy = order || undefined;
      obj.DateTimePart = dtPart || undefined;
      obj.DateTimeInterval = dtPart === 'Time' && dtInterval ? dtInterval : undefined;
      delete obj.OrderBy;
    } else {
      obj.OrderBy = order || undefined;
      delete obj.GroupBy;
      delete obj.DateTimePart;
      delete obj.DateTimeInterval;
    }

    // Remove undefined keys
    Object.keys(obj).forEach((k) => obj[k] === undefined && delete obj[k]);
    onBodyChange(JSON.stringify(obj, null, 2));
  };

  /** Save filter conditions to body JSON */
  const saveFilter = (conds: any[]) => {
    let obj: any = {};
    try {
      obj = JSON.parse(body || '{}');
    } catch {}
    if (conds.length > 0) {
      obj.Filter = { Operator: 0, Conditions: conds };
    } else {
      delete obj.Filter;
    }
    onBodyChange(JSON.stringify(obj, null, 2));
  };

  // ── Column Actions ──

  const changeColumn = (index: number, value?: string) => {
    const updated = [...columns];
    if (!value && updated.length > 1) {
      updated.splice(index, 1);
    } else {
      updated[index] = value ?? '';
    }
    setColumns(updated);
    saveColumns(updated, orderBy);
  };

  const addColumn = () => setColumns([...columns, '']);

  const changeOrderBy = (value?: string) => {
    const v = value ?? '';
    setOrderBy(v);
    saveColumns(columns, v);
  };

  // ── Filter Actions ──

  const addCondition = () => {
    if (!newAttr) {
      return;
    }
    const resolvedOp = newOperator === TIMESERIES_OPERATOR ? 6 : newOperator;
    const condition: any = { FieldName: newAttr, Operator: resolvedOp, Values: [...newValues] };
    if (newIsNot) {
      condition.IsNot = true;
    }
    saveFilter([...conditions, condition]);
    // Reset form
    setNewAttr('');
    setNewOperator(0);
    setNewValues(['']);
    setNewIsNot(false);
    setFormKey((k) => k + 1);
  };

  const removeCondition = (index: number) => saveFilter(conditions.filter((_, i) => i !== index));

  const updateCondition = (index: number, changes: any) => {
    const updated = conditions.map((c: any, i: number) => (i === index ? { ...c, ...changes } : c));
    // Remove undefined keys from the updated condition
    Object.keys(updated[index]).forEach((k) => updated[index][k] === undefined && delete updated[index][k]);
    saveFilter(updated);
  };

  /** Get the default values when switching operator */
  const defaultValues = (op: number, current: string[]): string[] => {
    if (op === TIMESERIES_OPERATOR) {
      return [TIMESERIES_FROM, TIMESERIES_TO];
    }
    if (op === 6) {
      return ['', ''];
    }
    return [current[0] || ''];
  };

  /** Get attribute type by name */
  const attrType = (name: string) => attributes.find((a) => a.value === name)?.attributeType;

  // ── Styles ──
  const rowStyle = css`
    display: flex;
    gap: 8px;
    margin-bottom: 4px;
    align-items: center;
    flex-wrap: wrap;
  `;
  const isNotStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  return (
    <>
      {/* ── Columns ── */}
      <InlineFieldRow>
        <InlineField
          label="Columns"
          grow
          className={css`
            flex: 1 1 0;
            min-width: 0;
          `}
        >
          <div
            className={css`
              display: flex;
              flex-wrap: wrap;
              gap: ${theme.spacing.sm};
              align-items: center;
              width: 100%;
            `}
          >
            {columns.map((col, i) => {
              if (isStats) {
                const [agg, attr] = splitColumnIntoAggAndAttribute(col);
                return (
                  <React.Fragment key={i}>
                    {i > 0 && (
                      <span
                        className={css`
                          font-weight: bold;
                          padding: 0 4px;
                          opacity: 0.7;
                        `}
                      >
                        +
                      </span>
                    )}
                    <div
                      className={css`
                        display: inline-flex;
                        gap: 2px;
                        border: 1px solid rgba(204, 204, 220, 0.15);
                        border-radius: 4px;
                        padding: 2px;
                      `}
                    >
                      <Select
                        placeholder="Function"
                        value={agg ? { label: `${agg}_`, value: agg } : undefined}
                        options={AGGREGATION_OPTIONS}
                        isClearable
                        onChange={(v) => changeColumn(i, buildColumn(v?.value ?? '', attr))}
                        width={14}
                      />
                      <Select
                        placeholder="Attribute"
                        isLoading={loadingAttrs}
                        value={attr ? { label: attr, value: attr } : undefined}
                        options={attributes}
                        isClearable
                        onChange={(v) => changeColumn(i, buildColumn(agg, v?.value ?? ''))}
                        width={18}
                      />
                    </div>
                  </React.Fragment>
                );
              }
              return (
                <Select
                  key={i}
                  placeholder="Column"
                  isLoading={loadingAttrs}
                  isClearable
                  value={col ? { label: col, value: col } : undefined}
                  options={attributes}
                  onChange={(v) => changeColumn(i, v?.value)}
                  width={20}
                />
              );
            })}
            <a className="gf-form-label" onClick={addColumn}>
              <Icon name="plus" />
            </a>
          </div>
        </InlineField>
      </InlineFieldRow>

      {/* ── OrderBy / GroupBy + DateTime ── */}
      {isStats ? (
        <>
          <InlineFieldRow>
            <InlineField label="GroupBy" grow>
              <Select
                placeholder="GroupBy"
                isLoading={loadingAttrs}
                isClearable
                value={orderBy ? { label: orderBy, value: orderBy } : undefined}
                options={attributes}
                onChange={(v) => changeOrderBy(v?.value)}
                width={20}
              />
            </InlineField>
          </InlineFieldRow>
          {attrType(orderBy) === 'TypeDateTime' && (
            <>
              <InlineFieldRow>
                <InlineField label="DateTimePart">
                  <Select
                    placeholder="DateTimePart"
                    isClearable
                    value={dateTimePart ? { label: dateTimePart, value: dateTimePart } : undefined}
                    options={DATE_TIME_PARTS}
                    onChange={(v) => {
                      const part = v?.value ?? '';
                      setDateTimePart(part);
                      if (part !== 'Time') {
                        setDateTimeInterval('');
                      }
                      saveColumns(columns, orderBy, part, part === 'Time' ? dateTimeInterval : '');
                    }}
                    width={16}
                  />
                </InlineField>
              </InlineFieldRow>
              {dateTimePart === 'Time' && (
                <InlineFieldRow>
                  <InlineField label="DateTimeInterval">
                    <Input
                      placeholder="e.g. 1h, 1m"
                      value={dateTimeInterval}
                      onChange={(e) => setDateTimeInterval(e.currentTarget.value)}
                      onBlur={(e) => saveColumns(columns, orderBy, dateTimePart, e.currentTarget.value)}
                      width={16}
                    />
                  </InlineField>
                </InlineFieldRow>
              )}
            </>
          )}
        </>
      ) : (
        <InlineFieldRow>
          <InlineField label="OrderBy" grow>
            <Select
              placeholder="OrderBy"
              isLoading={loadingAttrs}
              isClearable
              value={orderBy ? { label: orderBy, value: orderBy } : undefined}
              options={attributes}
              onChange={(v) => changeOrderBy(v?.value)}
              width={20}
            />
          </InlineField>
        </InlineFieldRow>
      )}

      {/* ── Filter Section ── */}
      <InlineFieldRow>
        <div
          className={css`
            display: flex;
            flex-direction: column;
            width: 100%;
          `}
        >
          {/* Toggle */}
          <div
            onClick={() => setFilterOpen(!filterOpen)}
            className={css`
              display: flex;
              align-items: center;
              cursor: pointer;
              font-weight: 500;
              padding: 4px 8px;
              border-radius: 4px;
              background-color: ${theme.colors.bg2};
              width: fit-content;
              user-select: none;
            `}
          >
            <span style={{ marginRight: '8px' }}>Filter</span>
            <Icon name={filterOpen ? 'angle-down' : 'angle-right'} />
          </div>

          {/* Conditions */}
          {filterOpen && (
            <div
              className={css`
                padding-left: 24px;
                padding-top: 12px;
                padding-bottom: ${theme.spacing.sm};
                display: flex;
                flex-direction: column;
                gap: 6px;
              `}
            >
              {/* Existing conditions */}
              {conditions.map((c: any, i: number) => {
                const isTs = isTimeseries(c);
                const displayOp = isTs ? TIMESERIES_OPERATOR : c.Operator;
                const opts = getConditionOptions(isTs ? 'TypeDateTime' : attrType(c.FieldName));
                const vals: string[] = c.Values || [''];

                return (
                  <div key={i} className={rowStyle}>
                    <Select
                      width={16}
                      options={attributes}
                      value={
                        attributes.find((a) => a.value === c.FieldName) || { label: c.FieldName, value: c.FieldName }
                      }
                      onChange={(v) => updateCondition(i, { FieldName: v.value })}
                      isLoading={loadingAttrs}
                    />
                    <Select
                      width={16}
                      options={opts}
                      value={
                        opts.find((o) => o.value === displayOp) || {
                          label: CONDITION_LABELS[c.Operator] || String(c.Operator),
                          value: c.Operator,
                        }
                      }
                      onChange={(v) => {
                        const op = v.value!;
                        const resolvedOp = op === TIMESERIES_OPERATOR ? 6 : op;
                        updateCondition(i, { Operator: resolvedOp, Values: defaultValues(op, vals) });
                      }}
                    />
                    <label style={isNotStyle}>
                      <input
                        type="checkbox"
                        checked={!!c.IsNot}
                        onChange={(e) => updateCondition(i, { IsNot: e.target.checked || undefined })}
                      />
                      Is Not
                    </label>
                    <ValueInputs
                      operator={displayOp}
                      values={vals}
                      onChange={(v) => updateCondition(i, { Values: v })}
                    />
                    <Icon
                      name="trash-alt"
                      onClick={() => removeCondition(i)}
                      style={{ cursor: 'pointer', color: theme.palette.red }}
                    />
                  </div>
                );
              })}

              {/* New condition form */}
              <div key={formKey} className={rowStyle} style={{ marginTop: 8 }}>
                <Select
                  width={16}
                  placeholder="Attribute"
                  options={attributes}
                  value={
                    newAttr ? attributes.find((a) => a.value === newAttr) || { label: newAttr, value: newAttr } : null
                  }
                  onChange={(v) => {
                    setNewAttr(v?.value || '');
                    // Reset operator if switching away from DateTime
                    if (attrType(v?.value || '') !== 'TypeDateTime' && newOperator === TIMESERIES_OPERATOR) {
                      setNewOperator(0);
                      setNewValues(['']);
                    }
                  }}
                  isLoading={loadingAttrs}
                  isClearable
                />
                <Select
                  width={16}
                  placeholder="Condition"
                  options={getConditionOptions(attrType(newAttr))}
                  value={getConditionOptions(attrType(newAttr)).find((o) => o.value === newOperator)}
                  onChange={(v) => {
                    const op = v.value!;
                    setNewOperator(op);
                    setNewValues(defaultValues(op, newValues));
                  }}
                />
                <label style={isNotStyle}>
                  <input type="checkbox" checked={newIsNot} onChange={(e) => setNewIsNot(e.target.checked)} />
                  Is Not
                </label>
                <ValueInputs operator={newOperator} values={newValues} onChange={setNewValues} />
                <div className="gf-form-label" onClick={addCondition} style={{ cursor: 'pointer' }}>
                  <Icon name="plus" /> Add
                </div>
              </div>
            </div>
          )}
        </div>
      </InlineFieldRow>
    </>
  );
};
