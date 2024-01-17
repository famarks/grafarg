import { GrafargTheme } from '@grafana/data';
import { stylesFactory } from '@grafana/ui';
import { css } from 'emotion';

export const getStyles = stylesFactory((theme: GrafargTheme, hidden: boolean) => ({
  color:
    hidden &&
    css`
      &,
      &:hover,
      label,
      a {
        color: ${hidden ? theme.colors.textFaint : theme.colors.text};
      }
    `,
}));
