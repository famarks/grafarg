import { GrafargTheme } from '@grafarg/data';
import { stylesFactory } from '@grafarg/ui';
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
