import { Field, PanelProps } from '@grafarg/data';
import { GraphNG, GraphNGLegendEvent, TooltipPlugin, ZoomPlugin } from '@grafarg/ui';
import { getFieldLinksForExplore } from 'app/features/explore/utils/links';
import React, { useCallback } from 'react';
import { changeSeriesColorConfigFactory } from './overrides/colorSeriesConfigFactory';
import { hideSeriesConfigFactory } from './overrides/hideSeriesConfigFactory';
import { AnnotationsPlugin } from './plugins/AnnotationsPlugin';
import { ContextMenuPlugin } from './plugins/ContextMenuPlugin';
import { ExemplarsPlugin } from './plugins/ExemplarsPlugin';
import { Options } from './types';

interface TimeSeriesPanelProps extends PanelProps<Options> {}

export const TimeSeriesPanel: React.FC<TimeSeriesPanelProps> = ({
  data,
  timeRange,
  timeZone,
  width,
  height,
  options,
  fieldConfig,
  onChangeTimeRange,
  onFieldConfigChange,
  replaceVariables,
}) => {
  const onLegendClick = useCallback(
    (event: GraphNGLegendEvent) => {
      onFieldConfigChange(hideSeriesConfigFactory(event, fieldConfig, data.series));
    },
    [fieldConfig, onFieldConfigChange, data.series]
  );

  const getFieldLinks = (field: Field, rowIndex: number) => {
    return getFieldLinksForExplore({ field, rowIndex, range: timeRange });
  };

  const onSeriesColorChange = useCallback(
    (label: string, color: string) => {
      onFieldConfigChange(changeSeriesColorConfigFactory(label, color, fieldConfig));
    },
    [fieldConfig, onFieldConfigChange]
  );

  if (!data || !data.series?.length) {
    return (
      <div className="panel-empty">
        <p>No data found in response</p>
      </div>
    );
  }

  return (
    <GraphNG
      data={data.series}
      timeRange={timeRange}
      timeZone={timeZone}
      width={width}
      height={height}
      legend={options.legend}
      onLegendClick={onLegendClick}
      onSeriesColorChange={onSeriesColorChange}
    >
      <ZoomPlugin onZoom={onChangeTimeRange} />
      <TooltipPlugin data={data.series} mode={options.tooltipOptions.mode} timeZone={timeZone} />
      <ContextMenuPlugin data={data.series} timeZone={timeZone} replaceVariables={replaceVariables} />
      {data.annotations && (
        <ExemplarsPlugin exemplars={data.annotations} timeZone={timeZone} getFieldLinks={getFieldLinks} />
      )}
      {data.annotations && <AnnotationsPlugin annotations={data.annotations} timeZone={timeZone} />}
    </GraphNG>
  );
};
