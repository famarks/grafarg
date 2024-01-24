import { applyFieldOverrides, DataFrame, GrafargTheme } from '@grafarg/data';

export function prepDataForStorybook(data: DataFrame[], theme: GrafargTheme) {
  return applyFieldOverrides({
    data: data,
    fieldConfig: {
      overrides: [],
      defaults: {},
    },
    theme,
    replaceVariables: (value: string) => value,
  });
}
