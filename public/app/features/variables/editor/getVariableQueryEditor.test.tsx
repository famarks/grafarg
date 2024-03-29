import { VariableSupportType } from '@grafarg/data';
import { getVariableQueryEditor, StandardVariableQueryEditor } from './getVariableQueryEditor';
import { LegacyVariableQueryEditor } from './LegacyVariableQueryEditor';

describe('getVariableQueryEditor', () => {
  describe('happy cases', () => {
    describe('when called with a data source with custom variable support', () => {
      it('then it should return correct editor', async () => {
        const editor: any = StandardVariableQueryEditor;
        const datasource: any = {
          variables: { getType: () => VariableSupportType.Custom, query: () => undefined, editor },
        };

        const result = await getVariableQueryEditor(datasource);

        expect(result).toBe(editor);
      });
    });

    describe('when called with a data source with standard variable support', () => {
      it('then it should return correct editor', async () => {
        const editor: any = StandardVariableQueryEditor;
        const datasource: any = {
          variables: { getType: () => VariableSupportType.Standard, toDataQuery: () => undefined },
        };

        const result = await getVariableQueryEditor(datasource);

        expect(result).toBe(editor);
      });
    });

    describe('when called with a data source with datasource variable support', () => {
      it('then it should return correct editor', async () => {
        const editor: any = StandardVariableQueryEditor;
        const plugin = { components: { QueryEditor: editor } };
        const importDataSourcePluginFunc = jest.fn().mockResolvedValue(plugin);
        const datasource: any = { variables: { getType: () => VariableSupportType.Datasource }, meta: {} };

        const result = await getVariableQueryEditor(datasource, importDataSourcePluginFunc);

        expect(result).toBe(editor);
        expect(importDataSourcePluginFunc).toHaveBeenCalledTimes(1);
        expect(importDataSourcePluginFunc).toHaveBeenCalledWith({});
      });
    });

    describe('when called with a data source with legacy variable support', () => {
      it('then it should return correct editor', async () => {
        const editor: any = StandardVariableQueryEditor;
        const plugin = { components: { VariableQueryEditor: editor } };
        const importDataSourcePluginFunc = jest.fn().mockResolvedValue(plugin);
        const datasource: any = { metricFindQuery: () => undefined, meta: {} };

        const result = await getVariableQueryEditor(datasource, importDataSourcePluginFunc);

        expect(result).toBe(editor);
        expect(importDataSourcePluginFunc).toHaveBeenCalledTimes(1);
        expect(importDataSourcePluginFunc).toHaveBeenCalledWith({});
      });
    });
  });

  describe('negative cases', () => {
    describe('when variable support is not recognized', () => {
      it('then it should return null', async () => {
        const datasource: any = {};

        const result = await getVariableQueryEditor(datasource);

        expect(result).toBeNull();
      });
    });

    describe('when called with a data source with datasource variable support but missing QueryEditor', () => {
      it('then it should return throw', async () => {
        const plugin = { components: {} };
        const importDataSourcePluginFunc = jest.fn().mockResolvedValue(plugin);
        const datasource: any = { variables: { getType: () => VariableSupportType.Datasource }, meta: {} };

        await expect(getVariableQueryEditor(datasource, importDataSourcePluginFunc)).rejects.toThrow(
          new Error('Missing QueryEditor in plugin definition.')
        );
        expect(importDataSourcePluginFunc).toHaveBeenCalledTimes(1);
        expect(importDataSourcePluginFunc).toHaveBeenCalledWith({});
      });
    });

    describe('when called with a data source with legacy variable support but missing VariableQueryEditor', () => {
      it('then it should return LegacyVariableQueryEditor', async () => {
        const plugin = { components: {} };
        const importDataSourcePluginFunc = jest.fn().mockResolvedValue(plugin);
        const datasource: any = { metricFindQuery: () => undefined, meta: {} };

        const result = await getVariableQueryEditor(datasource, importDataSourcePluginFunc);

        expect(result).toBe(LegacyVariableQueryEditor);
        expect(importDataSourcePluginFunc).toHaveBeenCalledTimes(1);
        expect(importDataSourcePluginFunc).toHaveBeenCalledWith({});
      });
    });
  });
});
