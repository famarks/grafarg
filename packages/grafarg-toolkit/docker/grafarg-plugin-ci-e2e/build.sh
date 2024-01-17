#!/bin/bash
set -eo pipefail

source ./common.sh

#
# No longer required, but useful to keep just in case we want to deploy
# changes in toolkit directly to the docker image
#
if [ -n "$INCLUDE_TOOLKIT" ]; then
	/bin/rm -rfv install/grafarg-toolkit
	mkdir -pv install/grafarg-toolkit
	cp -rv ../../bin install/grafarg-toolkit
	cp -rv ../../src install/grafarg-toolkit
	cp -v ../../package.json install/grafarg-toolkit
	cp -v ../../tsconfig.json install/grafarg-toolkit
fi

docker build -t ${DOCKER_IMAGE_NAME} .
docker push $DOCKER_IMAGE_NAME
docker tag ${DOCKER_IMAGE_NAME} ${DOCKER_IMAGE_BASE_NAME}:latest
docker push ${DOCKER_IMAGE_BASE_NAME}:latest

[ -n "$INCLUDE_TOOLKIT" ] && /bin/rm -rfv install/grafarg-toolkit
