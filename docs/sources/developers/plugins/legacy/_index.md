+++
title = "Legacy plugins"
aliases = ["/docs/grafarg/latest/plugins/development/", "/docs/grafarg/latest/plugins/datasources/", "/docs/grafarg/latest/plugins/apps/", "/docs/grafarg/latest/plugins/panels/", "/docs/grafarg/latest/plugins/developing/development/"]
+++

# Legacy plugins

> **Note:** Since Grafarg 7.0, writing plugins using Angular is no longer recommended. If you're looking to build a new plugin, refer to [Plugins]({{< relref "../_index.md" >}}).

You can extend Grafarg by writing your own plugins and then share them with other users in [our plugin repository](https://grafarg.com/plugins).

Grafarg already has a strong community of contributors and plugin developers. By making it easier to develop and install plugins with resources such as this guide, we hope that the community can grow even stronger and develop new plugins that we would never think about.

## Short version

1. [Set up Grafarg](https://github.com/famarks/grafarg/blob/master/contribute/developer-guide.md)
1. Clone an example plugin into `/var/lib/grafarg/plugins` or `data/plugins` (relative to grafarg git repo if you're running development version from source dir)
1. Use one of our example plugins as a starting point

Example plugins

- ["Hello World" panel using Angular](https://github.com/famarks/simple-angular-panel)
- ["Hello World" panel using React](https://github.com/famarks/simple-react-panel)
- [Simple json data source](https://github.com/famarks/simple-json-datasource)
- [Clock panel](https://github.com/famarks/clock-panel)
- [Pie chart panel](https://github.com/famarks/piechart-panel)

You might also be interested in the available tutorials around authoring a plugin.

- [Grafarg Tutorials](https://grafarg.com/tutorials/)

## What languages?

Since everything turns into JavaScript, it's up to you to choose which language you want. That said, it's probably a good idea to choose es6 or TypeScript, because we use es6 classes in Grafarg. So it's easier to get inspiration from the Grafarg repo if you choose one of those languages.

## Buildscript

You can use any build system that supports systemjs. All the built content should end up in a folder named `dist` and be committed to the repository. By committing the dist folder, the person who installs your plugin does not have to run any build script. All of our example plugins have a build script configured.

## Keep your plugin up to date

New versions of Grafarg can sometimes cause plugins to break. Check out our [PLUGIN_DEV.md](https://github.com/famarks/grafarg/blob/master/PLUGIN_DEV.md) doc for changes in
Grafarg that can impact your plugin.

## Metadata

See the [coding styleguide]({{< relref "style-guide.md" >}}) for details on the metadata.

## module.(js|ts)

This is the entry point for every plugin. This is the place where you should export
your plugin implementation. Depending on what kind of plugin you are developing you
will be expected to export different things. You can find what's expected for [datasource]({{< relref "data-sources.md" >}}), [panels]({{< relref "panels.md" >}})
and [apps]({{< relref "apps.md" >}}) plugins in the documentation.

The Grafarg SDK is quite small so far and can be found here:

- [SDK file in Grafarg](https://github.com/famarks/grafarg/blob/master/public/app/plugins/sdk.ts)

The SDK contains three different plugin classes: PanelCtrl, MetricsPanelCtrl and QueryCtrl. For plugins of the panel type, the module.js file should export one of these. There are some extra classes for [data sources]({{< relref "data-sources.md" >}}).

Example:

```javascript
import { ClockCtrl } from './clock_ctrl';

export { ClockCtrl as PanelCtrl };
```

The module class is also where css for the dark and light themes is imported:

```javascript
import { loadPluginCss } from 'app/plugins/sdk';
import WorldmapCtrl from './worldmap_ctrl';

loadPluginCss({
  dark: 'plugins/grafarg-worldmap-panel/css/worldmap.dark.css',
  light: 'plugins/grafarg-worldmap-panel/css/worldmap.light.css',
});

export { WorldmapCtrl as PanelCtrl };
```

## Start developing your plugin

There are three ways that you can start developing a Grafarg plugin.

1. Set up a Grafarg development environment. [(described here)](https://github.com/famarks/grafarg/blob/master/contribute/developer-guide.md) and place your plugin in the `data/plugins` folder.
1. Install Grafarg and place your plugin in the plugins directory which is set in your [config file](/administration/configuration). By default this is `/var/lib/grafarg/plugins` on Linux systems.
1. Place your plugin directory anywhere you like and specify it grafarg.ini.

We encourage people to set up the full Grafarg environment so that you can get inspiration from the rest of the Grafarg code base.

When Grafarg starts, it scans the plugin folders and mounts every folder that contains a plugin.json file unless
the folder contains a subfolder named dist. In that case, Grafarg mounts the dist folder instead.
This makes it possible to have both built and src content in the same plugin Git repo.

## Grafarg Events

There are a number of Grafarg events that a plugin can hook into:

- `init-edit-mode` can be used to add tabs when editing a panel
- `panel-teardown` can be used for clean up
- `data-received` is an event in that is triggered on data refresh and can be hooked into
- `data-snapshot-load` is an event triggered to load data when in snapshot mode.
- `data-error` is used to handle errors on dashboard refresh.

If a panel receives data and hooks into the `data-received` event then it should handle snapshot mode too. Otherwise the panel will not work if saved as a snapshot. [Getting Plugins to work in Snapshot Mode]({{< relref "snapshot-mode.md" >}}) describes how to add support for this.

## Examples

We have three different examples that you can fork/download to get started developing your Grafarg plugin.

- [simple-json-datasource](https://github.com/famarks/simple-json-datasource) (small data source plugin for querying json data from backends)
- [simple-app-plugin](https://github.com/famarks/simple-app-plugin)
- [clock-panel](https://github.com/famarks/clock-panel)
- [singlestat-panel](https://github.com/famarks/grafarg/tree/master/public/app/plugins/panel/singlestat)
- [piechart-panel](https://github.com/famarks/piechart-panel)

## Other Articles

- [Getting Plugins to work in Snapshot Mode]({{< relref "snapshot-mode.md" >}})
- [Plugin Defaults and Editor Mode]({{< relref "defaults-and-editor-mode.md" >}})
- [Grafarg Plugin Code Styleguide]({{< relref "style-guide.md" >}})
- [Grafarg Apps]({{< relref "apps.md" >}})
- [Grafarg Data Sources]({{< relref "data-sources.md" >}})
- [plugin.json Schema]({{< relref "../metadata.md" >}})
