import React, { memo } from 'react';
import { css } from 'emotion';
import { GrafargTheme, TimeOption } from '@grafarg/data';
import { useTheme, stylesFactory, styleMixins } from '../../../themes';
import { Icon } from '../../Icon/Icon';

const getStyles = stylesFactory((theme: GrafargTheme) => {
  return {
    container: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 7px 9px 7px 9px;
      border-left: 2px solid rgba(255, 255, 255, 0);

      &:hover {
        background: ${styleMixins.hoverColor(theme.colors.bg1, theme)};
        border-image: linear-gradient(#f05a28 30%, #fbca0a 99%);
        border-image-slice: 1;
        border-style: solid;
        border-top: 0;
        border-right: 0;
        border-bottom: 0;
        border-left-width: 2px;
        cursor: pointer;
      }
    `,
  };
});

interface Props {
  value: TimeOption;
  selected?: boolean;
  onSelect: (option: TimeOption) => void;
}

export const TimeRangeOption = memo<Props>(({ value, onSelect, selected = false }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <div className={styles.container} onClick={() => onSelect(value)} tabIndex={-1}>
      <span>{value.display}</span>
      {selected ? <Icon name="check" /> : null}
    </div>
  );
});

TimeRangeOption.displayName = 'TimeRangeOption';
