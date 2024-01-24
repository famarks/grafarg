import React, { FC, HTMLAttributes, ReactNode } from 'react';
import { stylesFactory, useTheme } from '../../themes';
import { css, cx } from 'emotion';
import { GrafargTheme } from '@grafarg/data';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const getTabContentStyle = stylesFactory((theme: GrafargTheme) => {
  return {
    tabContent: css`
      padding: ${theme.spacing.sm};
    `,
  };
});

export const TabContent: FC<Props> = ({ children, className, ...restProps }) => {
  const theme = useTheme();
  const styles = getTabContentStyle(theme);

  return (
    <div {...restProps} className={cx(styles.tabContent, className)}>
      {children}
    </div>
  );
};
