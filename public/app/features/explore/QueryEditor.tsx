// Libraries
import React, { PureComponent } from 'react';

// Services
import { getAngularLoader, AngularComponent } from '@grafarg/runtime';

// Types
import { DataQuery, TimeRange, EventBusExtended } from '@grafarg/data';
import 'app/features/plugins/plugin_loader';

interface QueryEditorProps {
  error?: any;
  datasource: any;
  onExecuteQuery?: () => void;
  onQueryChange?: (value: DataQuery) => void;
  initialQuery: DataQuery;
  exploreEvents: EventBusExtended;
  range: TimeRange;
  textEditModeEnabled?: boolean;
}

export default class QueryEditor extends PureComponent<QueryEditorProps, any> {
  element: any;
  component: AngularComponent;
  angularScope: any;

  async componentDidMount() {
    if (!this.element) {
      return;
    }

    const { datasource, initialQuery, exploreEvents } = this.props;

    const loader = getAngularLoader();
    const template = '<plugin-component type="query-ctrl"> </plugin-component>';
    const target = { datasource: datasource.name, ...initialQuery };
    const scopeProps = {
      ctrl: {
        datasource,
        target,
        refresh: () => {
          setTimeout(() => {
            // the "hide" attribute of the quries can be changed from the "outside",
            // it will be applied to "this.props.initialQuery.hide", but not to "target.hide".
            // so we have to apply it.
            if (target.hide !== this.props.initialQuery.hide) {
              target.hide = this.props.initialQuery.hide;
            }
            this.props.onQueryChange?.(target);
            this.props.onExecuteQuery?.();
          }, 1);
        },
        onQueryChange: () => {
          setTimeout(() => {
            this.props.onQueryChange?.(target);
          }, 1);
        },
        events: exploreEvents,
        panel: { datasource, targets: [target] },
        dashboard: {},
      },
    };

    this.component = loader.load(this.element, scopeProps, template);
    this.angularScope = scopeProps.ctrl;

    setTimeout(() => {
      this.props.onQueryChange?.(target);
      this.props.onExecuteQuery?.();
    }, 1);
  }

  componentDidUpdate(prevProps: QueryEditorProps) {
    const hasToggledEditorMode = prevProps.textEditModeEnabled !== this.props.textEditModeEnabled;
    const hasNewError = prevProps.error !== this.props.error;

    if (this.component) {
      if (hasToggledEditorMode && this.angularScope && this.angularScope.toggleEditorMode) {
        this.angularScope.toggleEditorMode();
      }

      if (hasNewError || hasToggledEditorMode) {
        // Some query controllers listen to data error events and need a digest
        // for some reason this needs to be done in next tick
        setTimeout(this.component.digest);
      }
    }
  }

  componentWillUnmount() {
    if (this.component) {
      this.component.destroy();
    }
  }

  render() {
    return <div className="gf-form-query" ref={(element) => (this.element = element)} style={{ width: '100%' }} />;
  }
}
