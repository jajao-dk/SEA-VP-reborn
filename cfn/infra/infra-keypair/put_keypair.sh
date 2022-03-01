#!/bin/sh

function create_keypair () {
    openssl genrsa -out private_key.pem 2048
    openssl rsa -pubout -in private_key.pem -out public_key.pem
}

function put_keypair () {
    echo ${GENVS} | jq

    local _PRIVATE=`cat private_key.pem`
    local _PUBLIC=`cat public_key.pem`
    rm private_key.pem public_key.pem

    local _TAGS=`convert_env_key_value_str ${GENVS} Tags`
    aws ssm put-parameter \
        --name /${EnvironmentName}/${AppName}/rsa/private \
        --value "${_PRIVATE}" \
        --type SecureString \
        --region ${DeployRegion} \
        --profile ${Profile} \
        --tags ${_TAGS}

    aws ssm put-parameter \
        --name /${EnvironmentName}/${AppName}/rsa/public \
        --value "${_PUBLIC}" \
        --type String \
        --region ${DeployRegion} \
        --profile ${Profile} \
        --tags ${_TAGS}
}

APP_BASE=`git rev-parse --show-toplevel`

. ${APP_BASE}/env_params/env_common.sh

echo "put keypair $1"

check_and_set_env $*
create_keypair
put_keypair
