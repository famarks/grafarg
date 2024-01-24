import { PanelModel } from '@grafarg/data';
import { sharedSingleStatMigrationHandler } from '@grafarg/ui';
import { BarGaugeOptions } from './types';

export const barGaugePanelMigrationHandler = (panel: PanelModel<BarGaugeOptions>): Partial<BarGaugeOptions> => {
  return sharedSingleStatMigrationHandler(panel);
};
