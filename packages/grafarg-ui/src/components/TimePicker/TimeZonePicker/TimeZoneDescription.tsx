import React, { PropsWithChildren, useMemo } from 'react';
import { css } from 'emotion';
import { GrafargTheme, TimeZoneInfo } from '@grafarg/data';
import { useTheme, stylesFactory } from '../../../themes';

interface Props {
  info?: TimeZoneInfo;
}

export const TimeZoneDescription: React.FC<PropsWithChildren<Props>> = ({ info }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const description = useDescription(info);

  if (!info) {
    return null;
  }

  return <div className={styles.description}>{description}</div>;
};

const useDescription = (info?: TimeZoneInfo): string => {
  return useMemo(() => {
    const parts: string[] = [];

    if (!info) {
      return '';
    }

    if (info.countries.length > 0) {
      const country = info.countries[0];
      parts.push(country.name);
    }

    if (info.abbreviation) {
      parts.push(info.abbreviation);
    }

    return parts.join(', ');
  }, [info]);
};

const getStyles = stylesFactory((theme: GrafargTheme) => {
  return {
    description: css`
      font-weight: normal;
      font-size: ${theme.typography.size.sm};
      color: ${theme.colors.textWeak};
      white-space: normal;
      text-overflow: ellipsis;
    `,
  };
});
