#!/bin/sh

function put_id () {
    echo ${GENVS} | jq

    local _ID=`get_cfn_export ${EnvironmentName}-${AppName}-CloudFront`

    local _TAGS=`convert_env_key_value_str ${GENVS} Tags`
    aws ssm put-parameter \
        --name /${EnvironmentName}/${AppName}/cloudfront/distribution-id \
        --value "${_ID}" \
        --type String \
        --region us-east-1 \
        --profile ${Profile} \
        --tags ${_TAGS}
}

APP_BASE=`git rev-parse --show-toplevel`

. ${APP_BASE}/env_params/env_common.sh

echo "put id $1"

check_and_set_env $*
put_id
