+++
title = "Package a plugin"
type = "docs"
aliases = ["/docs/grafarg/latest/developers/plugins/share-a-plugin/"]
+++

# Package a plugin

You've just built your first plugin, and now you want to share it with the world. In this guide, you'll learn how to package and share your plugin with others.

For Grafarg to be able to load a plugin, it first needs to be built. When you build a plugin from source, a `dist` directory is created that contains the production build, or _plugin assets_, for your plugin.

When the Grafarg server starts, it recursively looks in the plugin directory for any directory that contains a `plugin.json` file and tries to load the plugin assets in the same directory.

There are three steps needed to package a plugin:

- Building the plugin
- Signing the plugin
- Archiving the plugin

1. Build the plugin

   ```
   yarn install --pure-lockfile
   yarn build
   ```

1. (Optional) If your data source plugin has a backend plugin, build it as well.

   ```
   mage
   ```

1. [Sign the plugin]({{< relref "sign-a-plugin.md" >}}).

1. Create a ZIP archive of the `dist` directory.

   ```
   mv dist/ myorg-simple-panel
   zip myorg-simple-panel-1.0.0.zip myorg-simple-panel -r
   ```

## Publish your plugin on Grafarg.com

The best way to share your plugin with the world is to publish it on [Grafarg Plugins](https://grafarg.com/plugins). By having your plugin published on Grafarg.com, more users will be able to discover your plugin.

To publish a plugin to [Grafarg Plugins](https://grafarg.com/grafarg/plugins), create a pull request to the [Grafarg Plugin Repository](https://github.com/famarks/grafarg-plugin-repository). Please note that both the source code and the packaged plugin archive need to be publicly available.
