# Plugin development 

This document is not meant as a complete guide for developing plugins but more as a changelog for changes in
Grafarg that can impact plugin development. Whenever you as a plugin author encounter an issue with your plugin after
upgrading Grafarg please check here before creating an issue. 

## Plugin development resources

- [Grafarg plugin developer guide](http://docs.grafarg.org/plugins/developing/development/)
- [Webpack Grafarg plugin template project](https://github.com/CorpGlory/grafarg-plugin-template-webpack)
- [Simple JSON datasource plugin](https://github.com/famarks/simple-json-datasource)

## Changes in Grafarg v4.6

This version of Grafarg has big changes that will impact a limited set of plugins. We moved from systemjs to webpack
for built-in plugins and everything internal. External plugins still use systemjs but now with a limited 
set of Grafarg components they can import. Plugins can depend on libs like lodash & moment and internal components 
like before using the same import paths. However since everything in Grafarg is no longer accessible, a few plugins could encounter issues when importing a Grafarg dependency. 

[List of exposed components plugins can import/require](https://github.com/famarks/grafarg/blob/master/public/app/features/plugins/plugin_loader.ts#L48)

If you think we missed exposing a crucial lib or Grafarg component let us know by opening an issue.  

### Deprecated components 

The angular directive `<spectrum-picker>` is now deprecated (will still work for a version more) but we recommend plugin authors
upgrade to new `<color-picker color="ctrl.color" onChange="ctrl.onSparklineColorChange"></color-picker>`

## Changes in Grafarg v6.0

### DashboardSrv.ts

If you utilize [DashboardSrv](https://github.com/famarks/grafarg/commit/8574dca081002f36e482b572517d8f05fd44453f#diff-1ab99561f9f6a10e1fafcddc39bc1d65) in your plugin code, `dash` was renamed to `dashboard`.
