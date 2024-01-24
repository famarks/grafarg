import { SingleStatBaseOptions, BarGaugeDisplayMode } from '@grafarg/ui';
import { SelectableValue } from '@grafarg/data';

export interface BarGaugeOptions extends SingleStatBaseOptions {
  displayMode: BarGaugeDisplayMode;
  showUnfilled: boolean;
}

export const displayModes: Array<SelectableValue<string>> = [
  { value: BarGaugeDisplayMode.Gradient, label: 'Gradient' },
  { value: BarGaugeDisplayMode.Lcd, label: 'Retro LCD' },
  { value: BarGaugeDisplayMode.Basic, label: 'Basic' },
];
