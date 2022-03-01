#!/bin/sh

APP_BASE=`git rev-parse --show-toplevel`

. ${APP_BASE}/env_params/env_common.sh

echo "upload to pipeline $1 / $2"

check_and_set_env $*
upload_to_pipeline_s3 $2
