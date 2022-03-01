#!/bin/sh

APP_BASE=`git rev-parse --show-toplevel`

. ${APP_BASE}/env_params/env_common.sh

echo "put ssm $1 / $2"

check_and_set_env $*
put_ssm $2 $3
