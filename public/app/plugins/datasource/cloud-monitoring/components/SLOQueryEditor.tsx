import React from 'react';
import { Segment, SegmentAsync } from '@grafarg/ui';
import { SelectableValue } from '@grafarg/data';
import { selectors } from '../constants';
import { Project, AlignmentPeriods, AliasBy, QueryInlineField } from '.';
import { SLOQuery } from '../types';
import CloudMonitoringDatasource from '../datasource';

export interface Props {
  usedAlignmentPeriod?: number;
  variableOptionGroup: SelectableValue<string>;
  onChange: (query: SLOQuery) => void;
  onRunQuery: () => void;
  query: SLOQuery;
  datasource: CloudMonitoringDatasource;
}

export const defaultQuery: (dataSource: CloudMonitoringDatasource) => SLOQuery = (dataSource) => ({
  projectName: dataSource.getDefaultProject(),
  alignmentPeriod: 'cloud-monitoring-auto',
  aliasBy: '',
  selectorName: 'select_slo_health',
  serviceId: '',
  serviceName: '',
  sloId: '',
  sloName: '',
});

export function SLOQueryEditor({
  query,
  datasource,
  onChange,
  variableOptionGroup,
  usedAlignmentPeriod,
}: React.PropsWithChildren<Props>) {
  return (
    <>
      <Project
        templateVariableOptions={variableOptionGroup.options}
        projectName={query.projectName}
        datasource={datasource}
        onChange={(projectName) => onChange({ ...query, projectName })}
      />
      <QueryInlineField label="Service">
        <SegmentAsync
          allowCustomValue
          value={{ value: query?.serviceId, label: query?.serviceName || query?.serviceId }}
          placeholder="Select service"
          loadOptions={() =>
            datasource.getSLOServices(query.projectName).then((services) => [
              {
                label: 'Template Variables',
                options: variableOptionGroup.options,
              },
              ...services,
            ])
          }
          onChange={({ value: serviceId = '', label: serviceName = '' }) =>
            onChange({ ...query, serviceId, serviceName, sloId: '' })
          }
        />
      </QueryInlineField>

      <QueryInlineField label="SLO">
        <SegmentAsync
          allowCustomValue
          value={{ value: query?.sloId, label: query?.sloName || query?.sloId }}
          placeholder="Select SLO"
          loadOptions={() =>
            datasource.getServiceLevelObjectives(query.projectName, query.serviceId).then((sloIds) => [
              {
                label: 'Template Variables',
                options: variableOptionGroup.options,
              },
              ...sloIds,
            ])
          }
          onChange={async ({ value: sloId = '', label: sloName = '' }) => {
            const slos = await datasource.getServiceLevelObjectives(query.projectName, query.serviceId);
            const slo = slos.find(({ value }) => value === datasource.templateSrv.replace(sloId));
            onChange({ ...query, sloId, sloName, goal: slo?.goal });
          }}
        />
      </QueryInlineField>

      <QueryInlineField label="Selector">
        <Segment
          allowCustomValue
          value={[...selectors, ...variableOptionGroup.options].find((s) => s.value === query?.selectorName ?? '')}
          options={[
            {
              label: 'Template Variables',
              options: variableOptionGroup.options,
            },
            ...selectors,
          ]}
          onChange={({ value: selectorName }) => onChange({ ...query, selectorName })}
        />
      </QueryInlineField>

      <AlignmentPeriods
        templateSrv={datasource.templateSrv}
        templateVariableOptions={variableOptionGroup.options}
        alignmentPeriod={query.alignmentPeriod || ''}
        perSeriesAligner={query.selectorName === 'select_slo_health' ? 'ALIGN_MEAN' : 'ALIGN_NEXT_OLDER'}
        usedAlignmentPeriod={usedAlignmentPeriod}
        onChange={(alignmentPeriod) => onChange({ ...query, alignmentPeriod })}
      />
      <AliasBy value={query.aliasBy} onChange={(aliasBy) => onChange({ ...query, aliasBy })} />
    </>
  );
}
