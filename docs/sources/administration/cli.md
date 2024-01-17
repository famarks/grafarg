+++
title = "Grafarg CLI"
description = "Guide to using grafarg-cli"
keywords = ["grafarg", "cli", "grafarg-cli", "command line interface"]
weight = 400
+++

# Grafarg CLI

Grafarg CLI is a small executable that is bundled with Grafarg server. It can be executed on the same machine Grafarg server is running on. Grafarg CLI has `plugins` and `admin` commands, as well as global options.

To list all commands and options:
```
grafarg-cli -h
```
## Invoking Grafarg CLI

To invoke Grafarg CLI, add the path to the grafarg binaries in your `PATH` environment variable. Alternately, if your current directory is the `bin` directory, use `./grafarg-cli`. Otherwise, you can specify full path to the CLI. For example, on Linux `/usr/share/grafarg/bin/grafarg-cli` and on Windows `C:\Program Files\GrafargLabs\grafarg\bin\grafarg-cli.exe`.

>**Note:** Some commands, such as installing or removing plugins, require `sudo` on Linux. If you are on Windows, run Windows PowerShell as Administrator. 

## Grafarg CLI command syntax

The general syntax for commands in Grafarg CLI is:
```bash
grafarg-cli [global options] command [command options] [arguments...]
```

## Global options

Grafarg CLI allows you to temporarily override certain Grafarg default settings. Except for `--help` and `--version`, most global options are only used by developers.

Each global option applies only to the command in which it is used. For example, `--pluginsDir value` does not permanently change where Grafarg saves plugins. It only changes it for command in which you apply the option.

### Display Grafarg CLI help

`--help` or `-h` displays the help, including default paths and Docker configuration information.

**Example:**
```bash
grafarg-cli -h
```

### Display Grafarg CLI version

`--version` or `-v` prints the version of Grafarg CLI currently running.

**Example:**
```bash
grafarg-cli -v
```

### Override default plugin directory

`--pluginsDir value` overrides the path to where your local Grafarg instance stores plugins. Use this option if you want to install, update, or remove a plugin somewhere other than the default directory ("/var/lib/grafarg/plugins") [$GF_PLUGIN_DIR].

**Example:**
```bash
grafarg-cli --pluginsDir "/var/lib/grafarg/devplugins" plugins install <plugin-id>
```

### Override default plugin repo URL

`--repo value` allows you to download and install or update plugins from a repository other than the default Grafarg repo.

**Example:**
```bash
grafarg-cli --repo "https://example.com/plugins" plugins install <plugin-id>
```

### Override default plugin .zip URL

`--pluginUrl value` allows you to download a .zip file containing a plugin from a local URL instead of downloading it from the default Grafarg source.

**Example:**
```bash
grafarg-cli --pluginUrl https://company.com/grafarg/plugins/<plugin-id>-<plugin-version>.zip plugins install <plugin-id>
```

### Override Transport Layer Security

**Warning:** Turning off TLS is a significant security risk. We do not recommend using this option.

`--insecure` allows you to turn off Transport Layer Security (TLS) verification (insecure). You might want to do this if you are downloading a plugin from a non-default source.

**Example:**
```bash
grafarg-cli --insecure --pluginUrl https://company.com/grafarg/plugins/<plugin-id>-<plugin-version>.zip plugins install <plugin-id>
```

### Enable debug logging

`--debug` or `-d` enables debug logging. Debug output is returned and shown in the terminal.

**Example:**
```bash
grafarg-cli --debug plugins install <plugin-id>
```

### Override a configuration setting

`--configOverrides` is a command line argument that acts like an environmental variable override.

For example, you can use it to redirect logging to another file (maybe to log plugin installations in Grafarg Cloud) or when resetting the admin password and you have non-default values for some important configuration value (like where the database is located).

**Example:**
```bash
grafarg-cli --configOverrides cfg:default.paths.log=/dev/null plugins install <plugin-id>
```

### Override homepath value

Sets the path for the Grafarg install/home path, defaults to working directory. You do not need to use this if you are in the Grafarg installation directory when using the CLI.

**Example:**
```bash
grafarg-cli --homepath "/usr/share/grafarg" admin reset-admin-password <new password>
```

### Override config file

`--config value` overrides the default location where Grafarg expects the configuration file. Refer to [Configuration]({{< relref "../administration/configuration.md" >}}) for more information about configuring Grafarg and default configuration file locations.

**Example:**
```bash
grafarg-cli --config "/etc/configuration/" admin reset-admin-password mynewpassword
```

## Plugins commands

Grafarg CLI allows you to install, upgrade, and manage your Grafarg plugins. For more information about installing plugins, refer to [plugins page]({{< relref "../plugins/installation.md" >}}).

All listed commands apply to the Grafarg default repositories and directories. You can override the defaults with [Global Options](#global-options).

### List available plugins

```bash
grafarg-cli plugins list-remote
```

### Install the latest version of a plugin

```bash
grafarg-cli plugins install <plugin-id>
```

### Install a specific version of a plugin

```bash
grafarg-cli plugins install <plugin-id> <version>
```

### List installed plugins

```bash
grafarg-cli plugins ls
```

### Update all installed plugins
```bash
grafarg-cli plugins update-all
```

### Update one plugin

```bash
grafarg-cli plugins update <plugin-id>
```

### Remove one plugin

```bash
grafarg-cli plugins remove <plugin-id>
```

## Admin commands

Admin commands are only available in Grafarg 4.1 and later.

### Show all admin commands

```bash
grafarg-cli admin
```

### Reset admin password

`grafarg-cli admin reset-admin-password <new password>` resets the password for the admin user using the CLI. You might need to do this if you lose the admin password.

If there are two flags being used to set the homepath and the config file path, then running the command returns this error:

> Could not find config defaults, make sure homepath command line parameter is set or working directory is homepath

To correct this, use the `--homepath` global option to specify the Grafarg default homepath for this command:

```bash
grafarg-cli --homepath "/usr/share/grafarg" admin reset-admin-password <new password>
```

If you have not lost the admin password, we recommend that you change the user password either in the User Preferences or in the Server Admin > User tab.

If you need to set the password in a script, then you can use the [Grafarg User API]({{< relref "../http_api/user.md#change-password" >}}).

### Migrate data and encrypt passwords

`data-migration` runs a script that migrates or cleans up data in your database.

`encrypt-datasource-passwords` migrates passwords from unsecured fields to secure_json_data field. Returns `ok` unless there is an error. Safe to execute multiple times.

**Example:**
```bash
grafarg-cli admin data-migration encrypt-datasource-passwords
```
