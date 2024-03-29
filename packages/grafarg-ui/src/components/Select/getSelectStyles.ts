import { stylesFactory } from '../../themes/stylesFactory';
import { css } from 'emotion';
import { GrafargTheme } from '@grafarg/data';

export const getSelectStyles = stylesFactory((theme: GrafargTheme) => {
  const bgColor = theme.colors.formInputBg;
  const menuShadowColor = theme.colors.dropdownShadow;
  const optionBgHover = theme.colors.dropdownOptionHoverBg;
  const multiValueContainerBg = theme.colors.bg2;
  const multiValueColor = theme.colors.text;

  return {
    menu: css`
      label: grafarg-select-menu;
      background: ${bgColor};
      box-shadow: 0px 4px 4px ${menuShadowColor};
      position: relative;
      min-width: 100%;
      z-index: 1;
    `,
    option: css`
      label: grafarg-select-option;
      padding: 8px;
      display: flex;
      align-items: center;
      flex-direction: row;
      flex-shrink: 0;
      white-space: nowrap;
      cursor: pointer;
      border-left: 2px solid transparent;
      &:hover {
        background: ${optionBgHover};
      }
    `,
    optionImage: css`
      label: grafarg-select-option-image;
      width: 16px;
      margin-right: 10px;
    `,
    optionDescription: css`
      label: grafarg-select-option-description;
      font-weight: normal;
      font-size: ${theme.typography.size.sm};
      color: ${theme.colors.textWeak};
      white-space: normal;
      line-height: ${theme.typography.lineHeight.md};
    `,
    optionBody: css`
      label: grafarg-select-option-body;
      display: flex;
      font-weight: ${theme.typography.weight.semibold};
      flex-direction: column;
      flex-grow: 1;
    `,
    optionFocused: css`
      label: grafarg-select-option-focused;
      background: ${optionBgHover};
      border-image: linear-gradient(#f05a28 30%, #fbca0a 99%);
      border-image-slice: 1;
      border-style: solid;
      border-top: 0;
      border-right: 0;
      border-bottom: 0;
      border-left-width: 2px;
    `,
    singleValue: css`
      label: grafarg-select-single-value;
      color: ${theme.colors.formInputText};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      box-sizing: border-box;
      max-width: 100%;
    `,
    valueContainer: css`
      label: grafarg-select-value-container;
      align-items: center;
      display: flex;
      position: relative;
      box-sizing: border-box;
      flex: 1 1 0%;
      outline: none;
      overflow: hidden;
    `,
    valueContainerMulti: css`
      label: grafarg-select-value-container-multi;
      flex-wrap: wrap;
    `,
    loadingMessage: css`
      label: grafarg-select-loading-message;
      padding: ${theme.spacing.sm};
      text-align: center;
      width: 100%;
    `,
    multiValueContainer: css`
      label: grafarg-select-multi-value-container;
      display: flex;
      align-items: center;
      line-height: 1;
      background: ${multiValueContainerBg};
      border-radius: ${theme.border.radius.sm};
      margin: 0 ${theme.spacing.sm} 0 0;
      padding: ${theme.spacing.xxs} 0 ${theme.spacing.xxs} ${theme.spacing.sm};
      color: ${multiValueColor};
      font-size: ${theme.typography.size.sm};
    `,
    multiValueRemove: css`
      label: grafarg-select-multi-value-remove;
      margin: 0 ${theme.spacing.xs};
      cursor: pointer;
    `,
  };
});
