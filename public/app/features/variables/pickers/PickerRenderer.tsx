import React, { FunctionComponent, PropsWithChildren, ReactElement, useMemo } from 'react';
import { VariableHide, VariableModel } from '../types';
import { selectors } from '@grafarg/e2e-selectors';
import { variableAdapters } from '../adapters';
import { Tooltip } from '@grafarg/ui';

interface Props {
  variable: VariableModel;
}

export const PickerRenderer: FunctionComponent<Props> = (props) => {
  const PickerToRender = useMemo(() => variableAdapters.get(props.variable.type).picker, [props.variable]);

  if (!props.variable) {
    return <div>Couldn&apos;t load variable</div>;
  }

  return (
    <div className="gf-form">
      <PickerLabel variable={props.variable} />
      {props.variable.hide !== VariableHide.hideVariable && PickerToRender && (
        <PickerToRender variable={props.variable} />
      )}
    </div>
  );
};

function PickerLabel({ variable }: PropsWithChildren<Props>): ReactElement | null {
  const labelOrName = useMemo(() => variable.label || variable.name, [variable]);

  if (variable.hide !== VariableHide.dontHide) {
    return null;
  }

  if (variable.description) {
    return (
      <Tooltip content={variable.description} placement={'bottom'}>
        <label
          className="gf-form-label gf-form-label--variable"
          aria-label={selectors.pages.Dashboard.SubMenu.submenuItemLabels(labelOrName)}
        >
          {labelOrName}
        </label>
      </Tooltip>
    );
  }

  return (
    <label
      className="gf-form-label gf-form-label--variable"
      aria-label={selectors.pages.Dashboard.SubMenu.submenuItemLabels(labelOrName)}
    >
      {labelOrName}
    </label>
  );
}
