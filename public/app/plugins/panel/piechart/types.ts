import { PieChartType, SingleStatBaseOptions, PieChartLabels, PieChartLegendOptions } from '@grafarg/ui';

export interface PieChartOptions extends SingleStatBaseOptions {
  pieType: PieChartType;
  displayLabels: PieChartLabels[];
  legend: PieChartLegendOptions;
}
