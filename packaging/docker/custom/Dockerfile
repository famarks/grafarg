ARG GRAFARG_VERSION="latest"

FROM grafarg/grafarg:${GRAFARG_VERSION}

USER root

ARG GF_INSTALL_IMAGE_RENDERER_PLUGIN="false"

ARG GF_GID="0"
ENV GF_PATHS_PLUGINS="/var/lib/grafarg-plugins"

RUN mkdir -p "$GF_PATHS_PLUGINS" && \
    chown -R grafarg:${GF_GID} "$GF_PATHS_PLUGINS"

RUN if [ $GF_INSTALL_IMAGE_RENDERER_PLUGIN = "true" ]; then \
    echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories && \
    echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories && \
    echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories && \
    apk --no-cache  upgrade && \
    apk add --no-cache udev ttf-opensans chromium && \
    rm -rf /tmp/* && \
    rm -rf /usr/share/grafarg/tools/phantomjs; \
fi

USER grafarg

ENV GF_RENDERER_PLUGIN_CHROME_BIN="/usr/bin/chromium-browser"

RUN if [ $GF_INSTALL_IMAGE_RENDERER_PLUGIN = "true" ]; then \
    grafarg-cli \
        --pluginsDir "$GF_PATHS_PLUGINS" \
        --pluginUrl https://github.com/famarks/grafarg-image-renderer/releases/latest/download/plugin-linux-x64-glibc-no-chromium.zip \
        plugins install grafarg-image-renderer; \
fi

ARG GF_INSTALL_PLUGINS=""

RUN if [ ! -z "${GF_INSTALL_PLUGINS}" ]; then \
    OLDIFS=$IFS; \
        IFS=','; \
    for plugin in ${GF_INSTALL_PLUGINS}; do \
        IFS=$OLDIFS; \
        grafarg-cli --pluginsDir "$GF_PATHS_PLUGINS" plugins install ${plugin}; \
    done; \
fi
