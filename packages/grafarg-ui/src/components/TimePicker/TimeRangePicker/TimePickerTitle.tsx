import React, { memo, PropsWithChildren } from 'react';
import { css } from 'emotion';
import { GrafargTheme } from '@grafarg/data';
import { useTheme, stylesFactory } from '../../../themes';

const getStyle = stylesFactory((theme: GrafargTheme) => {
  return {
    text: css`
      font-size: ${theme.typography.size.md};
      font-weight: ${theme.typography.weight.semibold};
      color: ${theme.colors.formLabel};
    `,
  };
});

export const TimePickerTitle = memo<PropsWithChildren<{}>>(({ children }) => {
  const theme = useTheme();
  const styles = getStyle(theme);

  return <span className={styles.text}>{children}</span>;
});

TimePickerTitle.displayName = 'TimePickerTitle';
