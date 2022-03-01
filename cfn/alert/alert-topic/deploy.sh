#!/bin/sh

APP_BASE=`git rev-parse --show-toplevel`

. ${APP_BASE}/env_params/env_common.sh

echo "deploy $1 / $2"

check_and_set_env_region $*
deploy
add_tag_to_log_group
