#!/usr/bin/env bash

GPG_PASS=${1:-}

./scripts/build/update_repo/update-deb.sh "oss" "$GPG_PASS" "v5.4.3" "dist" "grafarg-testing-aptly-db"
