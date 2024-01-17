ARG BASE_IMAGE=alpine:3.13
FROM ${BASE_IMAGE}

ARG GRAFARG_TGZ="grafarg-latest.linux-x64-musl.tar.gz"

# Make sure we have Gnu tar
RUN apk add --no-cache tar

COPY ${GRAFARG_TGZ} /tmp/grafarg.tar.gz

# Change to tar xfzv to make tar print every file it extracts
RUN mkdir /tmp/grafarg && tar xzf /tmp/grafarg.tar.gz --strip-components=1 -C /tmp/grafarg

FROM ${BASE_IMAGE}

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

RUN apk add --no-cache ca-certificates bash tzdata && \
    apk add --no-cache openssl musl-utils

# Oracle Support for x86_64 only
RUN if [ `arch` = "x86_64" ]; then \
      apk add --no-cache libaio libnsl && \
      ln -s /usr/lib/libnsl.so.2 /usr/lib/libnsl.so.1 && \
      wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.30-r0/glibc-2.30-r0.apk \
        -O /tmp/glibc-2.30-r0.apk && \
      wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.30-r0/glibc-bin-2.30-r0.apk \
        -O /tmp/glibc-bin-2.30-r0.apk && \
      apk add --no-cache --allow-untrusted /tmp/glibc-2.30-r0.apk /tmp/glibc-bin-2.30-r0.apk && \
      rm -f /tmp/glibc-2.30-r0.apk && \
      rm -f /tmp/glibc-bin-2.30-r0.apk && \
      rm -f /lib/ld-linux-x86-64.so.2 && \
      rm -f /etc/ld.so.cache; \
    fi

COPY --from=0 /tmp/grafarg "$GF_PATHS_HOME"

RUN if [ ! $(getent group "$GF_GID") ]; then \
      addgroup -S -g $GF_GID grafarg; \
    fi

RUN export GF_GID_NAME=$(getent group $GF_GID | cut -d':' -f1) && \
    mkdir -p "$GF_PATHS_HOME/.aws" && \
    adduser -S -u $GF_UID -G "$GF_GID_NAME" grafarg && \
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

EXPOSE 3000

COPY ./run.sh /run.sh

USER "$GF_UID"
ENTRYPOINT [ "/run.sh" ]
