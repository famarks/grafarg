import React, { FC } from 'react';
import { Segment } from '@grafarg/ui';
import { SelectableValue } from '@grafarg/data';

interface Props {
  value: string;
  onChange: (item: SelectableValue<string>) => void;
}

const options = ['=', '!=', '<', '>', '=~', '!~'].map<SelectableValue<string>>((value) => ({
  label: value,
  value,
}));

export const OperatorSegment: FC<Props> = ({ value, onChange }) => {
  return <Segment className="query-segment-operator" value={value} options={options} onChange={onChange} />;
};
