import React, { useEffect, useState } from 'react';
import { config, GrafargBootConfig } from '@grafana/runtime';
import { ThemeContext } from '@grafana/ui';
import { appEvents } from '../core';
import { ThemeChangedEvent } from 'app/types/events';
import { GrafargTheme } from '@grafana/data';

export const ConfigContext = React.createContext<GrafargBootConfig>(config);
export const ConfigConsumer = ConfigContext.Consumer;

export const provideConfig = (component: React.ComponentType<any>) => {
  const ConfigProvider = (props: any) => (
    <ConfigContext.Provider value={config}>{React.createElement(component, { ...props })}</ConfigContext.Provider>
  );
  return ConfigProvider;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<GrafargTheme>(config.theme);

  useEffect(() => {
    const sub = appEvents.subscribe(ThemeChangedEvent, (event) => {
      config.theme = event.payload;
      setTheme(event.payload);
    });

    return () => sub.unsubscribe();
  }, []);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const provideTheme = (component: React.ComponentType<any>) => {
  return provideConfig((props: any) => <ThemeProvider>{React.createElement(component, { ...props })}</ThemeProvider>);
};
