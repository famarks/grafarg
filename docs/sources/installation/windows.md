+++
title = "Install on Windows"
description = "Install Grafarg on Windows"
keywords = ["grafarg", "configuration", "documentation", "windows"]
weight = 400
+++

# Install on Windows

You can either download the Windows installer package or a standalone Windows binary file.

Read [Upgrading Grafarg]({{< relref "upgrading.md" >}}) for tips and guidance on updating an existing
installation.

1. Navigate to [Download Grafarg](https://grafarg.com/grafarg/download?platform=windows).
1. Select a Grafarg version you want to install.
   - The most recent Grafarg version is selected by default.
   - The **Version** field displays only finished releases. If you want to install a beta version, click **Nightly Builds** and then select a version.
1. Select an **Edition**.
   - **Enterprise** - Recommended download. Functionally identical to the open source version, but includes features you can unlock with a license if you so choose.
   - **Open Source** - Functionally identical to the enterprise version, but you will need to download the enterprise version if you want enterprise features.
1. Click **Windows**.

You can either use the Windows installer or you can install a standalone Windows binary.

## Install with Windows installer (recommended)

1. Click **Download the installer**.
1. Open and run the installer.

To run Grafarg, open your browser and go to the Grafarg port (http://localhost:3000/ is default) and then follow the instructions in [Getting Started]({{< relref "../getting-started/getting-started/" >}}).

## Install standalone Windows binary

1. Click **Download the zip file**.
   **Important:** After you've downloaded the zip file and before extracting it, make sure to open the properties for that file (right-click **Properties**) and select the `unblock` check box and then click `Ok`.

1. Extract this folder to anywhere you want Grafarg to run from.

1. Start Grafarg by executing `grafarg-server.exe`, located in the `bin` directory, preferably from the command line. If you want to run Grafarg as a Windows service, then download
[NSSM](https://nssm.cc/). It is very easy to add Grafarg as a Windows service using that tool.

To run Grafarg, open your browser and go to the Grafarg port (http://localhost:3000/ is default) and then follow the instructions in [Getting Started]({{< relref "../getting-started/getting-started/" >}}).

> **Note:** The default Grafarg port is `3000`. This port might require extra permissions on Windows. If it does not appear in the default port, you can try changing to a different port.
>
> 1. Go into the `conf` directory and copy `sample.ini` to `custom.ini`.  **Note:** You should edit `custom.ini`, never `defaults.ini`.
> 1. Edit `custom.ini` and uncomment the `http_port` configuration option (`;` is the comment character in ini files) and change it to something like `8080` or similar. That port should not require extra Windows privileges.
> Read more about the [configuration options]({{< relref "../administration/configuration.md" >}}).
