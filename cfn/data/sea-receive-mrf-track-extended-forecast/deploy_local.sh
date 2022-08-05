#!/bin/sh

APP_BASE=`git rev-parse --show-toplevel`

. ${APP_BASE}/env_params/env_common.sh

echo "deploy local $1"

check_and_set_env $*
build_by_sam
deploy_by_sam
add_tag_to_log_group
