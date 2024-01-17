import darkTheme from './dark';
import lightTheme from './light';
import { GrafargTheme } from '@grafana/data';

let themeMock: ((name?: string) => GrafargTheme) | null;

export const getTheme = (name?: string) =>
  (themeMock && themeMock(name)) || (name === 'light' ? lightTheme : darkTheme);

export const mockTheme = (mock: (name?: string) => GrafargTheme) => {
  themeMock = mock;
  return () => {
    themeMock = null;
  };
};
