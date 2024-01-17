FROM node:14.15.5-alpine3.13 as js-builder

WORKDIR /usr/src/app/

COPY package.json yarn.lock ./
COPY packages packages

RUN yarn install --pure-lockfile --no-progress

COPY tsconfig.json .eslintrc .editorconfig .browserslistrc .prettierrc.js ./
COPY public public
COPY tools tools
COPY scripts scripts
COPY emails emails

ENV NODE_ENV production
RUN yarn build

FROM golang:1.16.1-alpine3.13 as go-builder

RUN apk add --no-cache gcc g++

WORKDIR $GOPATH/src/github.com/famarks/grafarg

COPY go.mod go.sum ./

RUN go mod verify

COPY pkg pkg
COPY build.go package.json ./

RUN go run build.go build

# Final stage
FROM alpine:3.13

LABEL maintainer="Grafarg team <hello@grafarg.com>"

ARG GF_UID="472"
ARG GF_GID="0"

ENV PATH="/usr/share/grafarg/bin:$PATH" \
    GF_PATHS_CONFIG="/etc/grafarg/grafarg.ini" \
    GF_PATHS_DATA="/var/lib/grafarg" \
    GF_PATHS_HOME="/usr/share/grafarg" \
    GF_PATHS_LOGS="/var/log/grafarg" \
    GF_PATHS_PLUGINS="/var/lib/grafarg/plugins" \
    GF_PATHS_PROVISIONING="/etc/grafarg/provisioning"

WORKDIR $GF_PATHS_HOME

RUN apk add --no-cache ca-certificates bash tzdata && \
    apk add --no-cache openssl musl-utils

COPY conf ./conf

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

COPY --from=go-builder /go/src/github.com/famarks/grafarg/bin/linux-amd64/grafarg-server /go/src/github.com/famarks/grafarg/bin/linux-amd64/grafarg-cli ./bin/
COPY --from=js-builder /usr/src/app/public ./public
COPY --from=js-builder /usr/src/app/tools ./tools

EXPOSE 3000

COPY ./packaging/docker/run.sh /run.sh

USER grafarg
ENTRYPOINT [ "/run.sh" ]
