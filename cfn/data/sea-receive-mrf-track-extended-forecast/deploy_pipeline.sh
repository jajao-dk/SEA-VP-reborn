#!/bin/sh

APP_BASE=`git rev-parse --show-toplevel`

. ${APP_BASE}/env_params/env_common.sh

echo "deploy pipeline $1"

check_and_set_env $*
deploy_pipeline ${APP_BASE}/template/pipeline_lambda.yaml
add_tag_to_log_group
