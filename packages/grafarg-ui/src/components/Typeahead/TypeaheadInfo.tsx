import React, { useContext } from 'react';
import { css, cx } from 'emotion';

import { CompletionItem, ThemeContext } from '../..';
import { GrafargTheme, renderMarkdown } from '@grafarg/data';

const getStyles = (theme: GrafargTheme, height: number, visible: boolean) => {
  return {
    typeaheadItem: css`
      label: type-ahead-item;
      z-index: 11;
      padding: ${theme.spacing.sm} ${theme.spacing.sm} ${theme.spacing.sm} ${theme.spacing.md};
      border-radius: ${theme.border.radius.md};
      border: ${theme.colors.border2};
      overflow-y: scroll;
      overflow-x: hidden;
      outline: none;
      background: ${theme.colors.bg2};
      color: ${theme.colors.text};
      box-shadow: 0 0 20px ${theme.colors.dropdownShadow};
      visibility: ${visible === true ? 'visible' : 'hidden'};
      width: 250px;
      height: ${height + parseInt(theme.spacing.xxs, 10)}px;
      position: relative;
      word-break: break-word;
    `,
  };
};

interface Props {
  item: CompletionItem;
  height: number;
}

export const TypeaheadInfo: React.FC<Props> = ({ item, height }) => {
  const visible = item && !!item.documentation;
  const label = item ? item.label : '';
  const documentation = renderMarkdown(item?.documentation);
  const theme = useContext(ThemeContext);
  const styles = getStyles(theme, height, visible);

  return (
    <div className={cx([styles.typeaheadItem])}>
      <b>{label}</b>
      <hr />
      <div dangerouslySetInnerHTML={{ __html: documentation }} />
    </div>
  );
};
