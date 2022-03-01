#!/bin/sh

APP_BASE=`git rev-parse --show-toplevel`

. ${APP_BASE}/env_params/env_common.sh

echo "deploy pipeline $1"

check_and_set_env $*
deploy_pipeline_s3 \
    ${APP_BASE}/template/architectures/x86_64/pipeline_html.yaml \
    wni-${EnvironmentName}-hosting-cloudfront-${Region} \
    ${EnvironmentName}-hosting-cloudfront-CloudFront
add_tag_to_log_group
