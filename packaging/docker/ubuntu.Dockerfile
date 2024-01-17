ARG BASE_IMAGE=ubuntu:20.04
FROM ${BASE_IMAGE} AS grafarg-builder

ARG GRAFARG_TGZ="grafarg-latest.linux-x64.tar.gz"

COPY ${GRAFARG_TGZ} /tmp/grafarg.tar.gz

RUN mkdir /tmp/grafarg && tar xzf /tmp/grafarg.tar.gz --strip-components=1 -C /tmp/grafarg

FROM ${BASE_IMAGE}

EXPOSE 3000

# Set DEBIAN_FRONTEND=noninteractive in environment at build-time
ARG DEBIAN_FRONTEND=noninteractive
ARG GF_UID="472"
ARG GF_GID="0"

ENV PATH=/usr/share/grafarg/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
    GF_PATHS_CONFIG="/etc/grafarg/grafarg.ini" \
    GF_PATHS_DATA="/var/lib/grafarg" \
    GF_PATHS_HOME="/usr/share/grafarg" \
    GF_PATHS_LOGS="/var/log/grafarg" \
    GF_PATHS_PLUGINS="/var/lib/grafarg/plugins" \
    GF_PATHS_PROVISIONING="/etc/grafarg/provisioning"

WORKDIR $GF_PATHS_HOME

# Install dependencies
# We need curl in the image
RUN apt-get update && apt-get install -y ca-certificates curl tzdata && \
    apt-get autoremove -y && rm -rf /var/lib/apt/lists/*;

COPY --from=grafarg-builder /tmp/grafarg "$GF_PATHS_HOME"

RUN if [ ! $(getent group "$GF_GID") ]; then \
      addgroup --system --gid $GF_GID grafarg; \
    fi

RUN export GF_GID_NAME=$(getent group $GF_GID | cut -d':' -f1) && \
    mkdir -p "$GF_PATHS_HOME/.aws" && \
    adduser --system --uid $GF_UID --ingroup "$GF_GID_NAME" grafarg && \
    mkdir -p "$GF_PATHS_PROVISIONING/datasources" \
             "$GF_PATHS_PROVISIONING/dashboards" \
             "$GF_PATHS_PROVISIONING/notifiers" \
             "$GF_PATHS_PROVISIONING/plugins" \
             "$GF_PATHS_LOGS" \
             "$GF_PATHS_PLUGINS" \
             "$GF_PATHS_DATA" && \
    cp "$GF_PATHS_HOME/conf/sample.ini" "$GF_PATHS_CONFIG" && \
    cp "$GF_PATHS_HOME/conf/ldap.toml" /etc/grafarg/ldap.toml && \
    chown -R "grafarg:$GF_GID_NAME" "$GF_PATHS_DATA" "$GF_PATHS_HOME/.aws" "$GF_PATHS_LOGS" "$GF_PATHS_PLUGINS" "$GF_PATHS_PROVISIONING" && \
    chmod -R 777 "$GF_PATHS_DATA" "$GF_PATHS_HOME/.aws" "$GF_PATHS_LOGS" "$GF_PATHS_PLUGINS" "$GF_PATHS_PROVISIONING"

COPY ./run.sh /run.sh

USER "$GF_UID"
ENTRYPOINT [ "/run.sh" ]
