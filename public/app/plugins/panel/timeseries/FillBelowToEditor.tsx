import React, { useMemo } from 'react';
import { FieldOverrideEditorProps, FieldType, getFieldDisplayName, SelectableValue } from '@grafarg/data';
import { Select } from '@grafarg/ui';

export const FillBellowToEditor: React.FC<FieldOverrideEditorProps<string, any>> = ({ value, context, onChange }) => {
  const names = useMemo(() => {
    const names: Array<SelectableValue<string>> = [];
    if (context.data.length) {
      for (const frame of context.data) {
        for (const field of frame.fields) {
          if (field.type === FieldType.number) {
            const label = getFieldDisplayName(field, frame, context.data);
            names.push({
              label,
              value: label,
            });
          }
        }
      }
    }
    return names;
  }, [context]);

  const current = useMemo(() => {
    const found = names.find((v) => v.value === value);
    if (found) {
      return found;
    }
    if (value) {
      return {
        label: value,
        value,
      };
    }
    return undefined;
  }, names);

  return (
    <Select
      options={names}
      value={current}
      onChange={(v) => {
        onChange(v.value);
      }}
    />
  );
};
