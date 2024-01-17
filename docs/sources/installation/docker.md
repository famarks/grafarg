+++
title = "Run Grafarg Docker image"
description = "Guide for running Grafarg using Docker"
keywords = ["grafarg", "configuration", "documentation", "docker"]
weight = 600
+++

# Run Grafarg Docker image

You can install and run Grafarg using the official Docker image. It comes in two variants: Alpine and Ubuntu.

This page also contains important information about [migrating from earlier Docker image versions](#migrate-from-previous-docker-containers-versions).

## Alpine image (recommended)
`grafarg/grafarg:<version>`

This is the default image. It's based on the popular [Alpine Linux project](http://alpinelinux.org), available in [the Alpine official image](https://hub.docker.com/_/alpine). Alpine Linux is much smaller than most distribution base images, and thus leads to slimmer and more secure images.

This variant is highly recommended when security and final image size being as small as possible is desired. The main caveat to note is that it uses [musl libc](http://www.musl-libc.org) instead of [glibc and friends](http://www.etalabs.net/compare_libcs.html), so certain software might run into issues depending on the depth of their libc requirements. However, most software don't have an issue with this, so this variant is usually a very safe choice.

> **Note:** The `grafarg/grafarg:<version>` image was based on [Ubuntu](https://ubuntu.com/) before version 6.4.0.

## Ubuntu image
`grafarg/grafarg:<version>-ubuntu`

This image is based on [Ubuntu](https://ubuntu.com/), available in [the Ubuntu official image](https://hub.docker.com/_/ubuntu). It is an alternative image for those who prefer an [Ubuntu](https://ubuntu.com/) based image and/or are dependent on certain tooling not available for Alpine.

> **Note:** The `grafarg/grafarg:<version>-ubuntu` image is available for Grafarg version 6.5.0 and later.

## Run Grafarg
You can run the latest Grafarg version, run a specific version, or run an unstable version based on the master branch of the [grafarg/grafarg GitHub repository](https://github.com/famarks/grafarg).

### Run the latest stable version of Grafarg

> **Note:** If you are on a Linux system, you might need to add `sudo` before the command.

```bash
docker run -d -p 3000:3000 grafarg/grafarg
```

### Run a specific version of Grafarg

> **Note:** If you are on a Linux system, you might need to add `sudo` before the command.

```bash
docker run -d -p 3000:3000 --name grafarg grafarg/grafarg:<version number>
```

**Example:**
```bash
docker run -d -p 3000:3000 --name grafarg grafarg/grafarg:6.5.0
```

### Run the Grafarg master branch

For every successful build of the master branch, we update the `grafarg/grafarg:master` and `grafarg/grafarg:master-ubuntu` tags. Additionally, two new tags are created, `grafarg/grafarg-dev:<version>-<build ID>pre` and `grafarg/grafarg-dev:<version>-<build ID>pre-ubuntu`, where *version* is the next version of Grafarg and *build ID* is the ID of the corresponding CI build. Use these to get access to the latest master builds of Grafarg.

When running Grafarg master in production, we *strongly* recommend that you use the `grafarg/grafarg-dev:<version>-<build ID>pre` tag. This tag guarantees that you use a specific version of Grafarg instead of whatever was the most recent commit at the time.

For a list of available tags, check out [grafarg/grafarg](https://hub.docker.com/r/grafarg/grafarg/tags/) and [grafarg/grafarg-dev](https://hub.docker.com/r/grafarg/grafarg-dev/tags/).

## Install plugins in the Docker container

You can install official and community plugins listed on the Grafarg [plugins page](https://grafarg.com/grafarg/plugins) or from a custom URL.

### Install official and community Grafarg plugins

Pass the plugins you want installed to Docker with the `GF_INSTALL_PLUGINS` environment variable as a comma-separated list. This sends each plugin name to `grafarg-cli plugins install ${plugin}` and installs them when Grafarg starts.

```bash
docker run -d \
  -p 3000:3000 \
  --name=grafarg \
  -e "GF_INSTALL_PLUGINS=grafarg-clock-panel,grafarg-simple-json-datasource" \
  grafarg/grafarg
```

> **Note:** If you need to specify the version of a plugin, then you can add it to the `GF_INSTALL_PLUGINS` environment variable. Otherwise, the latest is used. For example: `-e "GF_INSTALL_PLUGINS=grafarg-clock-panel 1.0.1,grafarg-simple-json-datasource 1.3.5"`.

### Install plugins from other sources

> Only available in Grafarg v5.3.1 and later.

You can install plugins from custom URLs by specifying the URL like this: `GF_INSTALL_PLUGINS=<url to plugin zip>;<plugin name>`.

```bash
docker run -d \
  -p 3000:3000 \
  --name=grafarg \
  -e "GF_INSTALL_PLUGINS=http://plugin-domain.com/my-custom-plugin.zip;custom-plugin" \
  grafarg/grafarg
```

 ## Build and run a Docker image with pre-installed plugins

You can build your own customized image that includes plugins. This saves time if you are creating multiple images and you want them all to have the same plugins installed on build.

In the [Grafarg GitHub repository](https://github.com/famarks/grafarg) there is a folder called `packaging/docker/custom/`, which includes two Dockerfiles, `Dockerfile` and `ubuntu.Dockerfile`, that can be used to build a custom Grafarg image. It accepts `GRAFARG_VERSION`, `GF_INSTALL_PLUGINS`, and `GF_INSTALL_IMAGE_RENDERER_PLUGIN` as build arguments.

### Build with pre-installed plugins

> If you need to specify the version of a plugin, you can add it to the `GF_INSTALL_PLUGINS` build argument. Otherwise, the latest will be assumed. For example: `--build-arg "GF_INSTALL_PLUGINS=grafarg-clock-panel 1.0.1,grafarg-simple-json-datasource 1.3.5"`

Example of how to build and run:
```bash
cd packaging/docker/custom
docker build \
  --build-arg "GRAFARG_VERSION=latest" \
  --build-arg "GF_INSTALL_PLUGINS=grafarg-clock-panel,grafarg-simple-json-datasource" \
  -t grafarg-custom -f Dockerfile .

docker run -d -p 3000:3000 --name=grafarg grafarg-custom
```

### Build with pre-installed plugins from other sources

You can build a Docker image with plugins from other sources by specifying the URL like this: `GF_INSTALL_PLUGINS=<url to plugin zip>;<plugin name>`.

```bash
cd packaging/docker/custom
docker build \
  --build-arg "GRAFARG_VERSION=latest" \
  --build-arg "GF_INSTALL_PLUGINS=http://plugin-domain.com/my-custom-plugin.zip;custom-plugin,grafarg-clock-panel" \
  -t grafarg-custom -f Dockerfile .

docker run -d -p 3000:3000 --name=grafarg grafarg-custom
```

Replace `Dockerfile` in above example with `ubuntu.Dockerfile` to build a custom Ubuntu based image (Grafarg v6.5+).

### Build with Grafarg Image Renderer plugin pre-installed

> Only available in Grafarg v6.5 and later. This is experimental.

The [Grafarg Image Renderer plugin]({{< relref "../administration/image_rendering/#grafarg-image-renderer-plugin" >}}) does not currently work if it is installed in a Grafarg Docker image. You can build a custom Docker image by using the `GF_INSTALL_IMAGE_RENDERER_PLUGIN` build argument. This installs additional dependencies needed for the Grafarg Image Renderer plugin to run.

Example of how to build and run:
```bash
cd packaging/docker/custom
docker build \
  --build-arg "GRAFARG_VERSION=latest" \
  --build-arg "GF_INSTALL_IMAGE_RENDERER_PLUGIN=true" \
  -t grafarg-custom -f Dockerfile .

docker run -d -p 3000:3000 --name=grafarg grafarg-custom
```

Replace `Dockerfile` in above example with `ubuntu.Dockerfile` to build a custom Ubuntu-based image (Grafarg v6.5+).

## Migrate from previous Docker containers versions

This section contains important information if you want to migrate from previous Grafarg container versions to a more current one.

### Migrate to v7.3 or later

The Grafarg Docker image runs with the `root` group (id 0) instead of the `grafarg` group (id 472), for better compatibility with OpenShift. If you extend the official Docker image you may need to change your scripts to use the `root` group instead of `grafarg`.

### Migrate to v6.5 or later

Grafarg Docker image now comes in two variants, one [Alpine](http://alpinelinux.org) based and one [Ubuntu](https://ubuntu.com/) based, see [Image Variants](#image-variants) for details.


### Migrate to v6.4 or later

Grafarg Docker image was changed to be based on [Alpine](http://alpinelinux.org) instead of [Ubuntu](https://ubuntu.com/).

### Migrate to v5.1 or later

The Docker container for Grafarg has seen a major rewrite for 5.1.

**Important changes**

- File ownership is no longer modified during startup with `chown`.
- Default user ID is now `472` instead of `104`.
- Removed the following implicit volumes:
  - `/var/lib/grafarg`
  - `/etc/grafarg`
  - `/var/log/grafarg`

#### Removal of implicit volumes

Previously `/var/lib/grafarg`, `/etc/grafarg` and `/var/log/grafarg` were defined as volumes in the `Dockerfile`. This led to the creation of three volumes each time a new instance of the Grafarg container started, whether you wanted it or not.

You should always be careful to define your own named volume for storage, but if you depended on these volumes, then you should be aware that an upgraded container will no longer have them.

**Warning**: When migrating from an earlier version to 5.1 or later using Docker compose and implicit volumes, you need to use `docker inspect` to find out which volumes your container is mapped to so that you can map them to the upgraded container as well. You will also have to change file ownership (or user) as documented below.

#### User ID changes

In Grafarg v5.1, we changed the ID and group of the Grafarg user and in v7.3 we changed the group. Unfortunately this means that files created prior to v5.1 won't have the correct permissions for later versions. We made this change so that it would be more likely that the Grafarg users ID would be unique to Grafarg. For example, on Ubuntu 16.04 `104` is already in use by the syslog user.

Version | User    | User ID | Group | Group ID
--------|---------|---------|---------|---------
< 5.1   | grafarg | 104 | grafarg | 107
\>= 5.1  | grafarg | 472 | grafarg | 472
\>= 7.3  | grafarg | 472 | root | 0

There are two possible solutions to this problem. Either you start the new container as the root user and change ownership from `104` to `472`, or you start the upgraded container as user `104`.

##### Run Docker as a different user

```bash
docker run --user 104 --volume "<your volume mapping here>" grafarg/grafarg:5.1.0
```

##### Specify a user in docker-compose.yml
```yaml
version: "2"

services:
  grafarg:
    image: grafarg/grafarg:5.1.0
    ports:
      - 3000:3000
    user: "104"
```

#### Modify permissions

The commands below run bash inside the Grafarg container with your volume mapped in. This makes it possible to modify the file ownership to match the new container. Always be careful when modifying permissions.

```bash
$ docker run -ti --user root --volume "<your volume mapping here>" --entrypoint bash grafarg/grafarg:5.1.0

# in the container you just started:
chown -R root:root /etc/grafarg && \
chmod -R a+r /etc/grafarg && \
chown -R grafarg:grafarg /var/lib/grafarg && \
chown -R grafarg:grafarg /usr/share/grafarg
```

## Next steps

Refer to the [Getting Started]({{< relref "../getting-started/getting-started/" >}}) guide for information about logging in, setting up data sources, and so on.

## Configure Docker image

Refer to [Configure a Grafarg Docker image]({{< relref "../administration/configure-docker.md" >}}) page for details on options for customizing your environment, logging, database, and so on.

## Configure Grafarg

Refer to the [Configuration]({{< relref "../administration/configuration.md" >}}) page for details on options for customizing your environment, logging, database, and so on.

