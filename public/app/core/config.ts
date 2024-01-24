import { config, GrafargBootConfig } from '@grafarg/runtime';
// Legacy binding paths
export { config, GrafargBootConfig as Settings };

let grafargConfig: GrafargBootConfig = config;

export default grafargConfig;

export const getConfig = () => {
  return grafargConfig;
};

export const updateConfig = (update: Partial<GrafargBootConfig>) => {
  grafargConfig = {
    ...grafargConfig,
    ...update,
  };
};
