import React from 'react';
import { LegacyForms } from '@grafarg/ui';
import { TemplateSrv } from '@grafarg/runtime';
import { SelectableValue } from '@grafarg/data';

import CloudMonitoringDatasource from '../datasource';
import { AnnotationsHelp, LabelFilter, Metrics, Project } from './';
import { toOption } from '../functions';
import { AnnotationTarget, EditorMode, MetricDescriptor } from '../types';

const { Input } = LegacyForms;

export interface Props {
  onQueryChange: (target: AnnotationTarget) => void;
  target: AnnotationTarget;
  datasource: CloudMonitoringDatasource;
  templateSrv: TemplateSrv;
}

interface State extends AnnotationTarget {
  variableOptionGroup: SelectableValue<string>;
  variableOptions: Array<SelectableValue<string>>;
  labels: any;
  [key: string]: any;
}

const DefaultTarget: State = {
  editorMode: EditorMode.Visual,
  projectName: '',
  projects: [],
  metricType: '',
  filters: [],
  metricKind: '',
  valueType: '',
  refId: 'annotationQuery',
  title: '',
  text: '',
  labels: {},
  variableOptionGroup: {},
  variableOptions: [],
};

export class AnnotationQueryEditor extends React.Component<Props, State> {
  state: State = DefaultTarget;

  async UNSAFE_componentWillMount() {
    // Unfortunately, migrations like this need to go UNSAFE_componentWillMount. As soon as there's
    // migration hook for this module.ts, we can do the migrations there instead.
    const { target, datasource } = this.props;
    if (!target.projectName) {
      target.projectName = datasource.getDefaultProject();
    }

    const variableOptionGroup = {
      label: 'Template Variables',
      options: datasource.getVariables().map(toOption),
    };

    const projects = await datasource.getProjects();
    this.setState({
      variableOptionGroup,
      variableOptions: variableOptionGroup.options,
      ...target,
      projects,
    });

    datasource
      .getLabels(target.metricType, target.projectName, target.refId)
      .then((labels) => this.setState({ labels }));
  }

  onMetricTypeChange = ({ valueType, metricKind, type, unit }: MetricDescriptor) => {
    const { onQueryChange, datasource } = this.props;
    this.setState(
      {
        metricType: type,
        unit,
        valueType,
        metricKind,
      },
      () => {
        onQueryChange(this.state);
      }
    );
    datasource.getLabels(type, this.state.refId, this.state.projectName).then((labels) => this.setState({ labels }));
  };

  onChange(prop: string, value: string | string[]) {
    this.setState({ [prop]: value }, () => {
      this.props.onQueryChange(this.state);
    });
  }

  render() {
    const { metricType, projectName, filters, title, text, variableOptionGroup, labels, variableOptions } = this.state;
    const { datasource } = this.props;

    return (
      <>
        <Project
          templateVariableOptions={variableOptions}
          datasource={datasource}
          projectName={projectName || datasource.getDefaultProject()}
          onChange={(value) => this.onChange('projectName', value)}
        />
        <Metrics
          projectName={projectName}
          metricType={metricType}
          templateSrv={datasource.templateSrv}
          datasource={datasource}
          templateVariableOptions={variableOptions}
          onChange={(metric) => this.onMetricTypeChange(metric)}
        >
          {(metric) => (
            <>
              <LabelFilter
                labels={labels}
                filters={filters}
                onChange={(value) => this.onChange('filters', value)}
                variableOptionGroup={variableOptionGroup}
              />
            </>
          )}
        </Metrics>
        <div className="gf-form gf-form-inline">
          <div className="gf-form">
            <span className="gf-form-label query-keyword width-9">Title</span>
            <Input
              type="text"
              className="gf-form-input width-20"
              value={title}
              onChange={(e) => this.onChange('title', e.target.value)}
            />
          </div>
          <div className="gf-form">
            <span className="gf-form-label query-keyword width-9">Text</span>
            <Input
              type="text"
              className="gf-form-input width-20"
              value={text}
              onChange={(e) => this.onChange('text', e.target.value)}
            />
          </div>
          <div className="gf-form gf-form--grow">
            <div className="gf-form-label gf-form-label--grow" />
          </div>
        </div>

        <AnnotationsHelp />
      </>
    );
  }
}
