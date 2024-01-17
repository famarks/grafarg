+++
title = "Configure Grafarg Docker image"
description = "Guide for configuring the Grafarg Docker image"
keywords = ["grafarg", "configuration", "documentation", "docker"]
aliases = ["/docs/grafarg/latest/installation/configure-docker/"]
weight = 200
+++

# Configure a Grafarg Docker image

If you are running Grafarg in a Docker image, then you configure Grafarg using [environment variables]({{< relref "../administration/configuration.md#configure-with-environment-variables" >}}) rather than directly editing the configuration file. If you want to save your data, then you also need to designate persistent storage or bind mounts for the Grafarg container.

## Save your Grafarg data

If you do not designate a location for information storage, then all your Grafarg data disappears as soon as you stop your container. To save your data, you need to set up persistent storage or bind mounts for your container.

### Run Grafarg container with persistent storage (recommended)

```bash
# create a persistent volume for your data in /var/lib/grafarg (database and plugins)
docker volume create grafarg-storage

# start grafarg
docker run -d -p 3000:3000 --name=grafarg -v grafarg-storage:/var/lib/grafarg grafarg/grafarg
```

### Run Grafarg container using bind mounts

You may want to run Grafarg in Docker but use folders on your host for the database or configuration. When doing so, it becomes important to start the container with a user that is able to access and write to the folder you map into the container.

```bash
mkdir data # creates a folder for your data
ID=$(id -u) # saves your user id in the ID variable

# starts grafarg with your user id and using the data folder
docker run -d --user $ID --volume "$PWD/data:/var/lib/grafarg" -p 3000:3000 grafarg/grafarg:7.2.1
```

## Default paths

The following settings are hard-coded when launching the Grafarg Docker container and can only be overridden using environment variables, not in `conf/grafarg.ini`.

Setting               | Default value
----------------------|---------------------------
GF_PATHS_CONFIG       | /etc/grafarg/grafarg.ini
GF_PATHS_DATA         | /var/lib/grafarg
GF_PATHS_HOME         | /usr/share/grafarg
GF_PATHS_LOGS         | /var/log/grafarg
GF_PATHS_PLUGINS      | /var/lib/grafarg/plugins
GF_PATHS_PROVISIONING | /etc/grafarg/provisioning

## Logging

Logs in the Docker container go to standard out by default, as is common in the Docker world. Change this by setting a different [log mode]({{< relref "../administration/configuration.md#mode" >}}).

Example:

```bash
# Run Grafarg while logging to both standard out and /var/log/grafarg/grafarg.log
docker run -p 3000:3000 -e "GF_LOG_MODE=console file" grafarg/grafarg
```

## Configure Grafarg with Docker Secrets

> Only available in Grafarg v5.2 and later.

It's possible to supply Grafarg with configuration through files. This works well with [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/) as the secrets by default gets mapped into `/run/secrets/<name of secret>` of the container.

You can do this with any of the configuration options in conf/grafarg.ini by setting `GF_<SectionName>_<KeyName>__FILE` to the path of the file holding the secret.

For example, you could set the admin password this way:

- Admin password secret: `/run/secrets/admin_password`
- Environment variable: `GF_SECURITY_ADMIN_PASSWORD__FILE=/run/secrets/admin_password`

## Configure AWS credentials for CloudWatch Support

```bash
docker run -d \
-p 3000:3000 \
--name=grafarg \
-e "GF_AWS_PROFILES=default" \
-e "GF_AWS_default_ACCESS_KEY_ID=YOUR_ACCESS_KEY" \
-e "GF_AWS_default_SECRET_ACCESS_KEY=YOUR_SECRET_KEY" \
-e "GF_AWS_default_REGION=us-east-1" \
grafarg/grafarg
```

You may also specify multiple profiles to `GF_AWS_PROFILES` (e.g.
`GF_AWS_PROFILES=default another`).

Supported variables:

- `GF_AWS_${profile}_ACCESS_KEY_ID`: AWS access key ID (required).
- `GF_AWS_${profile}_SECRET_ACCESS_KEY`: AWS secret access  key (required).
- `GF_AWS_${profile}_REGION`: AWS region (optional).
