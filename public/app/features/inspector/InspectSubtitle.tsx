import React, { FC } from 'react';
import { css } from 'emotion';
import { stylesFactory, useTheme, Tab, TabsBar } from '@grafarg/ui';
import { GrafargTheme, SelectableValue, PanelData, getValueFormat, formattedValueToString } from '@grafarg/data';
import { InspectTab } from '../inspector/types';

interface Props {
  tab: InspectTab;
  tabs: Array<{ label: string; value: InspectTab }>;
  data?: PanelData;
  onSelectTab: (tab: SelectableValue<InspectTab>) => void;
}

export const InspectSubtitle: FC<Props> = ({ tab, tabs, onSelectTab, data }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <>
      {data && <div className="muted">{formatStats(data)}</div>}
      <TabsBar className={styles.tabsBar}>
        {tabs.map((t, index) => {
          return (
            <Tab
              key={`${t.value}-${index}`}
              label={t.label}
              active={t.value === tab}
              onChangeTab={() => onSelectTab(t)}
            />
          );
        })}
      </TabsBar>
    </>
  );
};

const getStyles = stylesFactory((theme: GrafargTheme) => {
  return {
    tabsBar: css`
      padding-left: ${theme.spacing.md};
      margin: ${theme.spacing.lg} -${theme.spacing.sm} -${theme.spacing.lg} -${theme.spacing.lg};
    `,
  };
});

function formatStats(data: PanelData) {
  const { request } = data;
  if (!request) {
    return '';
  }

  const queryCount = request.targets.length;
  const requestTime = request.endTime ? request.endTime - request.startTime : 0;
  const formatted = formattedValueToString(getValueFormat('ms')(requestTime));

  return `${queryCount} queries with total query time of ${formatted}`;
}
