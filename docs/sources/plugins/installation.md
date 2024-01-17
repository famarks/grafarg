+++
title = "Install plugins"
aliases = ["/docs/grafarg/latest/plugins/installation/"]
weight = 1
+++

# Install Grafarg plugins

Grafarg supports data source, panel, and app plugins. Having panels as plugins makes it easy to create and add any kind of panel, to show your data, or improve your favorite dashboards. Apps enable the bundling of data sources, panels, dashboards, and Grafarg pages into a cohesive experience.

1. In a web browser, navigate to the official [Grafarg Plugins page](https://grafarg.com/plugins) and find a plugin that you want to install.
1. Click the plugin, and then click the **Installation** tab.

## Install plugin on Grafarg Cloud

On the Installation tab, in the **For** field, click the name of the Grafarg instance that you want to install the plugin on.

Grafarg Cloud handles the plugin installation automatically.

## Install plugin on local Grafarg

Follow the instructions on the Install tab. You can either install the plugin with a Grafarg CLI command or by downloading and uncompress a .zip file into the Grafarg plugins directory. We recommend using Grafarg CLI in most instances. The .zip option is available if your Grafarg server does not have access to the internet.

For more information about Grafarg CLI plugin commands, refer to [Plugin commands]({{< relref "../administration/cli.md#plugins-commands" >}}).

### Install a packaged plugin

After the user has downloaded the archive containing the plugin assets, they can install it by extracting the archive into their plugin directory.

```
unzip my-plugin-0.2.0.zip -d YOUR_PLUGIN_DIR/my-plugin
```

The path to the plugin directory is defined in the configuration file. For more information, refer to [Configuration]({{< relref "../administration/configuration.md#plugins" >}}).
