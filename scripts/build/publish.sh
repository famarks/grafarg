#!/bin/sh

# no relation to publish.go

# shellcheck disable=SC2124

EXTRA_OPTS="$@"

# Right now we hack this in into the publish script.
# Eventually we might want to keep a list of all previous releases somewhere.
_releaseNoteUrl="https://community.grafarg.com/t/release-notes-v7-0-x/29381"
_whatsNewUrl="https://grafarg.com/docs/grafarg/latest/guides/whats-new-in-v7-0/"

./scripts/build/release_publisher/release_publisher \
    --wn "${_whatsNewUrl}" \
    --rn "${_releaseNoteUrl}" \
    --version "${CIRCLE_TAG}" \
    --apikey  "${GRAFARG_COM_API_KEY}" "${EXTRA_OPTS}"
