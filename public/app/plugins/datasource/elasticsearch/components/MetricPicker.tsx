import React, { FunctionComponent } from 'react';
import { css, cx } from 'emotion';
import { SelectableValue } from '@grafarg/data';
import { Segment } from '@grafarg/ui';
import { describeMetric } from '../utils';
import { MetricAggregation } from './QueryEditor/MetricAggregationsEditor/aggregations';

const noWrap = css`
  white-space: nowrap;
`;

const toOption = (metric: MetricAggregation) => ({
  label: describeMetric(metric),
  value: metric,
});

const toOptions = (metrics: MetricAggregation[]): Array<SelectableValue<MetricAggregation>> => metrics.map(toOption);

interface Props {
  options: MetricAggregation[];
  onChange: (e: SelectableValue<MetricAggregation>) => void;
  className?: string;
  value?: string;
}

export const MetricPicker: FunctionComponent<Props> = ({ options, onChange, className, value }) => {
  const selectedOption = options.find((option) => option.id === value);

  return (
    <Segment
      className={cx(className, noWrap)}
      options={toOptions(options)}
      onChange={onChange}
      placeholder="Select Metric"
      value={!!selectedOption ? toOption(selectedOption) : null}
    />
  );
};
