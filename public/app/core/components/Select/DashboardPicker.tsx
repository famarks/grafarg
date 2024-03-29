import React, { FC } from 'react';
import debounce from 'debounce-promise';
import { SelectableValue } from '@grafarg/data';
import { AsyncSelect } from '@grafarg/ui';
import { backendSrv } from 'app/core/services/backend_srv';
import { DashboardSearchHit } from 'app/features/search/types';
import { DashboardDTO } from 'app/types';

export interface Props {
  onChange: (dashboard: DashboardDTO) => void;
  value?: SelectableValue;
  width?: number;
  isClearable?: boolean;
  invalid?: boolean;
  disabled?: boolean;
}

const getDashboards = (query = '') => {
  return backendSrv.search({ type: 'dash-db', query }).then((result: DashboardSearchHit[]) => {
    return result.map((item: DashboardSearchHit) => ({
      id: item.id,
      uid: item.uid,
      value: item.id,
      label: `${item?.folderTitle ?? 'General'}/${item.title}`,
    }));
  });
};

export const DashboardPicker: FC<Props> = ({ onChange, value, width, isClearable = false, invalid, disabled }) => {
  const debouncedSearch = debounce(getDashboards, 300);

  return (
    <AsyncSelect
      width={width}
      isClearable={isClearable}
      defaultOptions={true}
      loadOptions={debouncedSearch}
      onChange={onChange}
      placeholder="Select dashboard"
      noOptionsMessage="No dashboards found"
      value={value}
      invalid={invalid}
      disabled={disabled}
    />
  );
};
