+++
title = "Plugin signatures"
type = "docs"
aliases = ["/docs/grafarg/latest/plugins/plugin-signature-verification"]
+++

# Plugin signatures

Plugin signature verification (signing) is a security measure to make sure plugins haven't been tampered with. Upon loading, Grafarg checks to see if a plugin is signed or unsigned when inspecting and verifying its digital signature.

At startup, Grafarg verifies the signatures of every plugin in the plugin directory. You can see the result of this verification for each plugin by navigating to **Configuration** -> **Plugins**.

> **Note:** If you're a plugin developer and want to know how to sign your plugin, refer to [Sign a plugin]({{< relref "../developers/plugins/sign-a-plugin.md" >}}).

| Signature status | Description |
| ---------------- | ----------- |
| Core | Core plugin built into Grafarg. |
| Invalid signature | The plugin has a invalid signature. |
| Modified signature | The plugin has changed since it was signed. This may indicate malicious intent. |
| Unsigned | The plugin is not signed. |
| Signed | The plugin signature was successfully verified. |

## Plugin signature levels

All plugins is signed under a _signature level_. The signature level determines how the plugin can be distributed.

|**Plugin Level**|**Description**|
|---|---|
|Private|<p>Private plugins are for use on your own Grafarg. They may not be distributed to the Grafarg community, and are not published in the Grafarg catalog.</p>|
|Community|<p>Community plugins have dependent technologies that are open source and not for profit.</p><p>Community plugins are published in the official Grafarg catalog, and are available to the Grafarg community.</p>|
|Commercial|<p>Commercial plugins have dependent technologies that are closed source or commercially backed.</p><p>Commercial Plugins are published on the official Grafarg catalog, and are available to the Grafarg community.</p>|

## Backend plugins

If a [backend plugin]({{< relref "../developers/plugins/backend/_index.md" >}}) is unsigned, then Grafarg won't load or start it. If you try to load a backend plugin with an missing or invalid signature, then Grafarg writes an error message to the server log:

```bash
EROR[06-01|16:45:59] Failed to load plugin   error=plugin <plugin id> is unsigned
```

> **Note:** All Grafarg Labs authored backend plugins, including Enterprise plugins, are signed.

## Allow unsigned plugins

We strongly recommend that you don't run unsigned plugins in your Grafarg installation. If you're aware of the risks and you still want to load an unsigned plugin, refer to [Configuration]({{< relref "../administration/configuration.md#allow-loading-unsigned-plugins" >}}).

If you've allowed loading of an unsigned backend plugin, then Grafarg writes a warning message to the server log:

```bash
WARN[06-01|16:45:59] Running an unsigned backend plugin   pluginID=<plugin id>
```

> **Note:** If you're developing a plugin, then you can enable development mode to allow all unsigned plugins.
