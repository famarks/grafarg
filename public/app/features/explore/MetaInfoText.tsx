import React, { memo, useContext } from 'react';
import { css } from 'emotion';
import { GrafargTheme } from '@grafarg/data';
import { stylesFactory, ThemeContext } from '@grafarg/ui';

const getStyles = stylesFactory((theme: GrafargTheme) => ({
  metaContainer: css`
    flex: 1;
    color: ${theme.colors.textWeak};
    margin-bottom: ${theme.spacing.d};
    min-width: 30%;
    display: flex;
  `,
  metaItem: css`
    margin-right: ${theme.spacing.d};
    display: flex;
    align-items: baseline;

    .logs-meta-item__error {
      color: ${theme.palette.red};
    }
  `,
  metaLabel: css`
    margin-right: calc(${theme.spacing.d} / 2);
    font-size: ${theme.typography.size.sm};
    font-weight: ${theme.typography.weight.semibold};
  `,
  metaValue: css`
    font-family: ${theme.typography.fontFamily.monospace};
  `,
}));

export interface MetaItemProps {
  label?: string;
  value: string | JSX.Element;
}

export const MetaInfoItem = memo(function MetaInfoItem(props: MetaItemProps) {
  const theme = useContext(ThemeContext);
  const style = getStyles(theme);
  const { label, value } = props;

  return (
    <div className={style.metaItem}>
      {label && <span className={style.metaLabel}>{label}:</span>}
      <span className={style.metaValue}>{value}</span>
    </div>
  );
});

export interface MetaInfoTextProps {
  metaItems: MetaItemProps[];
}

export const MetaInfoText = memo(function MetaInfoText(props: MetaInfoTextProps) {
  const theme = useContext(ThemeContext);
  const style = getStyles(theme);
  const { metaItems } = props;

  return (
    <div className={style.metaContainer}>
      {metaItems.map((item, index) => (
        <MetaInfoItem key={`${index}-${item.label}`} label={item.label} value={item.value} />
      ))}
    </div>
  );
});

export default MetaInfoText;
