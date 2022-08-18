#!/bin/sh

APP_BASE=`git rev-parse --show-toplevel`

. ${APP_BASE}/env_params/env_common.sh

echo "add tag $1"

check_and_set_env $*
add_tag_to_log_group
