import { GrafargTheme, GrafargThemeType } from '../../types/theme';

export function getTestTheme(type: GrafargThemeType = GrafargThemeType.Dark): GrafargTheme {
  return ({
    type,
    isDark: type === GrafargThemeType.Dark,
    isLight: type === GrafargThemeType.Light,
    colors: {
      panelBg: 'white',
    },
  } as unknown) as GrafargTheme;
}
