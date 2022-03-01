#
# Directory
#
function get_category_name () {
    echo "$(basename $(dirname $(cd $(dirname $0); pwd)))"
}

function get_app_name () {
    echo "$(basename $(cd $(dirname $0); pwd))" | sed s/${Project}-//
}

#
# Params
#
function convert_env_str () {
    echo `jq -n -r ''$1' | if .'$2' then .'$2' else {} end | to_entries[] | .key + "=" + .value' | xargs -n2`
}

function convert_env_key_value_str () {
    echo `jq -n -r ''$1' | if .'$2' then .'$2' else {} end | to_entries[] | "Key=" + .key + ",Value=" + .value' | xargs -n2`
}

function set_env () {
    local _EXPS=`convert_env_str $1 Exports`
    for el in ${_EXPS}; do
        export "$el"
    done

    local _ENVS=`convert_env_str $1 Parameters`
    for el in ${_ENVS}; do
        export "$el"
    done

    add_env $1
}

function add_env () {
    GENVS=`jq -c -n ''${GENVS}' * '$1''`
}

#
# Resource
#
function get_cfn_export () {
    local _EXPORT=`aws cloudformation list-exports \
        --region ${DeployRegion} \
        --profile ${Profile} \
        --query "Exports[?Name=='$1'].Value" \
        --output text`
    if [ -z "${_EXPORT}" ]; then
        echo "$1 is not exist."
        exit 1
    fi
    echo ${_EXPORT}
}

function add_tag_to_alarm () {
    local _TARGET=$1
    if [ -z "${_TARGET}" ]; then
        _TARGET="${EnvironmentName}-${AppName}"
    fi

    local _ALARMS=`aws cloudwatch describe-alarms \
        --alarm-name-prefix ${_TARGET} \
        --region ${DeployRegion} \
        --profile ${Profile} \
        --query "MetricAlarms[].AlarmArn"`

    echo ${_ALARMS} | jq

    local _TAGS=`convert_env_key_value_str ${GENVS} Tags`
    for el in `echo ${_ALARMS} | jq -r '.[]'`; do
        aws cloudwatch tag-resource \
            --resource-arn $el \
            --tags ${_TAGS} \
            --region ${DeployRegion} \
            --profile ${Profile}
    done
}

function add_tag_to_log_group () {
    local _TARGET=$1
    if [ -z "${_TARGET}" ]; then
        _TARGET="${EnvironmentName}-${AppName}"
    fi

    local _GROUPS=`aws logs describe-log-groups \
        --region ${DeployRegion} \
        --profile ${Profile} \
        --query "logGroups[?contains(logGroupName, '${_TARGET}')].logGroupName"`

    echo ${_GROUPS} | jq

    local _TAGS=`echo ${GENVS} | jq -c '.Tags'`
    for el in `echo ${_GROUPS} | jq -r '.[]'`; do
        aws logs tag-log-group \
            --log-group-name $el \
            --tags ${_TAGS} \
            --region ${DeployRegion} \
            --profile ${Profile}
    done
}

function add_tag_to_rule () {
    local _TARGET=$1
    if [ -z "${_TARGET}" ]; then
        _TARGET="${EnvironmentName}-${AppName}"
    fi

    local _RULES=`aws events list-rules \
        --name-prefix ${_TARGET} \
        --region ${DeployRegion} \
        --profile ${Profile} \
        --query "Rules[].Arn"`

    echo ${_RULES} | jq

    local _TAGS=`convert_env_key_value_str ${GENVS} Tags`
    for el in `echo ${_RULES} | jq -r '.[]'`; do
        aws events tag-resource \
            --resource-arn $el \
            --tags ${_TAGS} \
            --region ${DeployRegion} \
            --profile ${Profile}
    done
}

function put_ssm () {
    echo ${GENVS} | jq

    local _TAGS=`convert_env_key_value_str ${GENVS} Tags`
    aws ssm put-parameter \
        --name /${EnvironmentName}/${AppName}/$1 \
        --value $2 \
        --type String \
        --region ${DeployRegion} \
        --profile ${Profile} \
        --tags ${_TAGS}
}

#
# Deploy
#
function init () {
    GENVS="{}"

    set_env `cat ${APP_BASE}/env_params/env.json | jq . -c`

    if [ -z "${Planning}" ]; then
        echo "undefined Planning"
        exit 1
    fi

    if [ -z "${Project}" ]; then
        echo "undefined Project"
        exit 1
    fi
}

function check_env () {
    if [ $# -lt 1 ]; then
        echo "need EnvironmentName[dev|stg|prd]"
        exit 1
    fi

    ParamEnvironment=$1
    if [ "$ParamEnvironment" = "prd" ]; then
        EnvironmentPrefix=${Planning}
        EnvironmentName=${Project}
        Profile="${ProfilePrefix}_prd"
    elif [ "$ParamEnvironment" = "stg" ]; then
        EnvironmentPrefix="stg-${Planning}"
        EnvironmentName="stg-${Project}"
        Profile="${ProfilePrefix}_stg"
    elif [ "$ParamEnvironment" = "dev" ]; then
        EnvironmentPrefix="dev-${Planning}"
        EnvironmentName="dev-${Project}"
        Profile="${ProfilePrefix}_dev"
    else
        echo "need EnvironmentName[dev|stg|prd]"
        exit 1
    fi
}

function check_env_region () {
    if [ $# -lt 2 ]; then
        echo "need EnvironmentName[dev|stg|prd] DeployRegion[ane1|use1|..etc]"
        exit 1
    fi

    ParamEnvironment=$1
    if [ "$ParamEnvironment" = "prd" ]; then
        EnvironmentPrefix=${Planning}
        EnvironmentName=${Project}
        Profile="${ProfilePrefix}_prd"
    elif [ "$ParamEnvironment" = "stg" ]; then
        EnvironmentPrefix="stg-${Planning}"
        EnvironmentName="stg-${Project}"
        Profile="${ProfilePrefix}_stg"
    elif [ "$ParamEnvironment" = "dev" ]; then
        EnvironmentPrefix="dev-${Planning}"
        EnvironmentName="dev-${Project}"
        Profile="${ProfilePrefix}_dev"
    else
        echo "need EnvironmentName[dev|stg|prd] DeployRegion[ane1|use1|..etc]"
        exit 1
    fi

    Region=$2
}

function check_and_set_env () {
    check_env $*

    if [ ! -f cfn_params/param_${ParamEnvironment}.json ]; then
        echo "no file: cfn_params/param_${ParamEnvironment}.json"
        exit 1
    fi

    local _CATEGORY_NAME=`get_category_name`
    local _APP_NAME=`get_app_name`
    local _JSON='''{
        "Exports": {"Profile": "'${Profile}'"},
        "Parameters": {
            "EnvironmentPrefix": "'${EnvironmentPrefix}'",
            "EnvironmentName": "'${EnvironmentName}'",
            "CategoryName": "'${_CATEGORY_NAME}'",
            "AppName": "'${_APP_NAME}'"
        }
    }'''
    _JSON=`echo ${_JSON} | jq . -c`
    set_env `jq -c -s ''${_JSON}' * .[0]' cfn_params/param_${ParamEnvironment}.json`

    local _MAP=`jq -n -r ''${GENVS}' | .Tags."map-migrated"'`
    if [ -z "${_MAP}" ]; then
        echo "undefined Tags.map-migrated"
        exit 1
    fi
}

function check_and_set_env_region () {
    check_env_region $*

    if [ ! -f cfn_params/${Region}/param_${ParamEnvironment}.json ]; then
        echo "no file: cfn_params/${Region}/param_${ParamEnvironment}.json"
        exit 1
    fi

    local _CATEGORY_NAME=`get_category_name`
    local _APP_NAME=`get_app_name`
    local _JSON='''{
        "Exports": {"Profile": "'${Profile}'"},
        "Parameters": {
            "Region": "'${Region}'",
            "EnvironmentPrefix": "'${EnvironmentPrefix}'",
            "EnvironmentName": "'${EnvironmentName}'",
            "CategoryName": "'${_CATEGORY_NAME}'",
            "AppName": "'${_APP_NAME}'"
        }
    }'''
    _JSON=`echo ${_JSON} | jq . -c`
    set_env `jq -c -s ''${_JSON}' * .[0]' cfn_params/${Region}/param_${ParamEnvironment}.json`

    local _MAP=`jq -n -r ''${GENVS}' | .Tags."map-migrated"'`
    if [ -z "${_MAP}" ]; then
        echo "undefined Tags.map-migrated"
        exit 1
    fi
}

function deploy () {
    echo ${GENVS} | jq

    local _PARAMS=`convert_env_str ${GENVS} Parameters`
    local _TAGS=`convert_env_str ${GENVS} Tags`
    sam deploy \
        --stack-name ${EnvironmentName}-${AppName} \
        --capabilities CAPABILITY_NAMED_IAM \
        --parameter-overrides ${_PARAMS} \
        --region ${DeployRegion} \
        --profile ${Profile} \
        --tags ${_TAGS}
}

function deploy_pipeline () {
    local _TEMPLATE=$1
    if [ ! -f ${_TEMPLATE} ]; then
        echo "no such file: ${_TEMPLATE}"
        exit 1
    fi

    local _TARGET=$2
    if [ -z "${_TARGET}" ]; then
        _TARGET="${EnvironmentName}-infra-cicd"
    fi
    local _JSON='''{
        "Parameters": {"CiCdPrefix": "'${_TARGET}'"}
    }'''
    _JSON=`echo ${_JSON} | jq . -c`
    add_env ${_JSON}

    echo ${GENVS} | jq

    local _PARAMS=`convert_env_str ${GENVS} Parameters`
    local _TAGS=`convert_env_str ${GENVS} Tags`
    sam deploy \
        --stack-name ${EnvironmentName}-${AppName}-pipeline \
        --template-file ${_TEMPLATE} \
        --capabilities CAPABILITY_NAMED_IAM \
        --parameter-overrides ${_PARAMS} \
        --region ${DeployRegion} \
        --profile ${Profile} \
        --tags ${_TAGS}
}

function deploy_pipeline_s3 () {
    local _TEMPLATE=$1
    if [ ! -f ${_TEMPLATE} ]; then
        echo "no such file: ${_TEMPLATE}"
        exit 1
    fi

    local _TARGET=$4
    if [ -z "${_TARGET}" ]; then
        _TARGET="${EnvironmentName}-infra-cicd"
    fi
    local _JSON='''{
        "Parameters": {
            "CiCdPrefix": "'${_TARGET}'",
            "BucketName": "'$2'",
            "DistributionId": "'$3'"
        }
    }'''
    _JSON=`echo ${_JSON} | jq . -c`
    add_env ${_JSON}

    echo ${GENVS} | jq

    local _PARAMS=`convert_env_str ${GENVS} Parameters`
    local _TAGS=`convert_env_str ${GENVS} Tags`
    sam deploy \
        --stack-name ${EnvironmentName}-${AppName}-pipeline \
        --template-file ${_TEMPLATE} \
        --capabilities CAPABILITY_NAMED_IAM \
        --parameter-overrides ${_PARAMS} \
        --region ${DeployRegion} \
        --profile ${Profile} \
        --tags ${_TAGS}
}

function upload_to_pipeline () {
    local _COPIED=0
    if [ ! -f buildspec.yaml ]; then
        cp $1 buildspec.yaml
        _COPIED=1
    fi

    if [ ! -f buildspec.yaml ]; then
        echo "no such file: buildspec.yaml"
        exit 1
    fi

    local _TARGET=$2
    if [ -z "${_TARGET}" ]; then
        _TARGET="${EnvironmentName}-infra-cicd-Bucket"
    fi

    local _BUCKET=`get_cfn_export ${_TARGET}`
    echo "CiCdBucket=${_BUCKET}"

    echo ${GENVS} | jq 'del(.Exports)' > cfn_params/param.json

    rm -rf .zip
    mkdir .zip
    zip \
        -r .zip/${AppName}_input.zip \
        cfn_params src *.yaml \
        -x \*__pycache__/\* \*/.\* \*tests/\* \*__main__.py \*cov\*.xml \*pyrightconfig.json > /dev/null 2>&1

    cat cfn_params/param.json | jq

    aws s3 cp \
        .zip/${AppName}_input.zip \
        s3://${_BUCKET}/artifact/${EnvironmentName}/ \
        --region ${DeployRegion} \
        --profile ${Profile}

    rm -rf .zip
    rm cfn_params/param.json

    if [ ${_COPIED} == 1 ]; then
        rm buildspec.yaml
    fi
}

function upload_to_pipeline_s3 () {
    local _DIRECTORY=$1
    if [ ! -f src/${_DIRECTORY}/buildspec.yaml ]; then
        echo "no such file: buildspec.yaml"
        exit 1
    fi

    local _TARGET=$2
    if [ -z "${_TARGET}" ]; then
        _TARGET="${EnvironmentName}-infra-cicd-Bucket"
    fi

    local _BUCKET=`get_cfn_export ${_TARGET}`
    echo "CiCdBucket=${_BUCKET}"

    rm -rf .zip
    mkdir .zip
    (cd src/${_DIRECTORY} && \
        zip \
            -pr ../../.zip/${AppName}_input.zip \
            . \
            -x \*dist\* \*node_modules\* \*package-lock.json\* > /dev/null 2>&1)

    echo ${GENVS} | jq

    aws s3 cp \
        .zip/${AppName}_input.zip \
        s3://${_BUCKET}/artifact/${EnvironmentName}/ \
        --region ${DeployRegion} \
        --profile ${Profile}

    rm -rf .zip
}

init
