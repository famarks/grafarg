import {
  SingleStatBaseOptions,
  BigValueColorMode,
  BigValueGraphMode,
  BigValueJustifyMode,
  BigValueTextMode,
} from '@grafarg/ui';
import {
  ReducerID,
  standardEditorsRegistry,
  FieldOverrideContext,
  getFieldDisplayName,
  escapeStringForRegex,
  VizOrientation,
  PanelOptionsEditorBuilder,
} from '@grafarg/data';

// Structure copied from angular
export interface StatPanelOptions extends SingleStatBaseOptions {
  graphMode: BigValueGraphMode;
  colorMode: BigValueColorMode;
  justifyMode: BigValueJustifyMode;
  textMode: BigValueTextMode;
}

export function addStandardDataReduceOptions<T extends SingleStatBaseOptions>(
  builder: PanelOptionsEditorBuilder<T>,
  includeOrientation = true,
  includeFieldMatcher = true,
  includeTextSizes = true
) {
  builder.addRadio({
    path: 'reduceOptions.values',
    name: 'Show',
    description: 'Calculate a single value per column or series or show each row',
    settings: {
      options: [
        { value: false, label: 'Calculate' },
        { value: true, label: 'All values' },
      ],
    },
    defaultValue: false,
  });

  builder.addNumberInput({
    path: 'reduceOptions.limit',
    name: 'Limit',
    description: 'Max number of rows to display',
    settings: {
      placeholder: '5000',
      integer: true,
      min: 1,
      max: 5000,
    },
    showIf: (options) => options.reduceOptions.values === true,
  });

  builder.addCustomEditor({
    id: 'reduceOptions.calcs',
    path: 'reduceOptions.calcs',
    name: 'Calculation',
    description: 'Choose a reducer function / calculation',
    editor: standardEditorsRegistry.get('stats-picker').editor as any,
    defaultValue: [ReducerID.lastNotNull],
    // Hides it when all values mode is on
    showIf: (currentConfig) => currentConfig.reduceOptions.values === false,
  });

  if (includeFieldMatcher) {
    builder.addSelect({
      path: 'reduceOptions.fields',
      name: 'Fields',
      description: 'Select the fields that should be included in the panel',
      settings: {
        allowCustomValue: true,
        options: [],
        getOptions: async (context: FieldOverrideContext) => {
          const options = [
            { value: '', label: 'Numeric Fields' },
            { value: '/.*/', label: 'All Fields' },
          ];
          if (context && context.data) {
            for (const frame of context.data) {
              for (const field of frame.fields) {
                const name = getFieldDisplayName(field, frame, context.data);
                const value = `/^${escapeStringForRegex(name)}$/`;
                options.push({ value, label: name });
              }
            }
          }
          return Promise.resolve(options);
        },
      },
      defaultValue: '',
    });
  }

  if (includeOrientation) {
    builder.addRadio({
      path: 'orientation',
      name: 'Orientation',
      description: 'Stacking direction in case of multiple series or fields',
      settings: {
        options: [
          { value: VizOrientation.Auto, label: 'Auto' },
          { value: VizOrientation.Horizontal, label: 'Horizontal' },
          { value: VizOrientation.Vertical, label: 'Vertical' },
        ],
      },
      defaultValue: VizOrientation.Auto,
    });
  }

  if (includeTextSizes) {
    builder.addNumberInput({
      path: 'text.titleSize',
      category: ['Text size'],
      name: 'Title',
      settings: {
        placeholder: 'Auto',
        integer: false,
        min: 1,
        max: 200,
      },
      defaultValue: undefined,
    });

    builder.addNumberInput({
      path: 'text.valueSize',
      category: ['Text size'],
      name: 'Value',
      settings: {
        placeholder: 'Auto',
        integer: false,
        min: 1,
        max: 200,
      },
      defaultValue: undefined,
    });
  }
}
