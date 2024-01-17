#!/bin/bash
set -eo pipefail

_version="1.3.1"
_tag="grafarg/grafarg-ci-deploy:${_version}"

docker build -t $_tag .
docker push $_tag
