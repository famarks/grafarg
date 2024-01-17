import { GrafargThemeType } from '@grafana/data';

type VariantDescriptor = { [key in GrafargThemeType]: string | number };

/**
 * @deprecated use theme.isLight ? or theme.isDark instead
 */
export const selectThemeVariant = (variants: VariantDescriptor, currentTheme?: GrafargThemeType) => {
  return variants[currentTheme || GrafargThemeType.Dark];
};
