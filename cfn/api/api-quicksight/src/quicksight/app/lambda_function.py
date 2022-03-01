from __future__ import annotations

import json
from typing import Any

from aws_lambda_powertools.event_handler.api_gateway import (
    ApiGatewayResolver, ProxyEventType, Response)
from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.logging.correlation_paths import API_GATEWAY_REST
from aws_lambda_powertools.utilities.data_classes.api_gateway_proxy_event import \
    APIGatewayProxyEvent
from aws_lambda_powertools.utilities.typing import LambdaContext

from .utils.aws import get_quicksight_client
from .utils.handler import api_handler
from .values import Env

logger = Logger()
app = ApiGatewayResolver(ProxyEventType.APIGatewayProxyEvent, strip_prefixes=['/v1'])


def check_user(event: APIGatewayProxyEvent, claims: dict[str, Any], user: dict[str, Any]):
    # TODO: サービスを利用して良いUserIDかチェックする
    return claims['sub'].startswith('google-apps|') or claims['sub'].startswith('auth0|')


@api_handler(validation_handler=check_user)
def get_embed_url(event: APIGatewayProxyEvent):
    user = event.request_context.authorizer['user']
    if 'oe' not in user:
        return Response(403, 'text/plain', 'Forbidden')

    name_space = user.get('oe',{}).get('qs_ns',None)
    user_name = user.get('oe',{}).get('qs_user',None)
    dashboard_id = user.get('oe',{}).get('qs_did',None)
    if not (name_space and user_name and dashboard_id) :
        return Response(403, 'text/plain', 'Forbidden')

    user_arn = 'arn:aws:quicksight:{0}:{1}:user/{2}/{3}'.format(
        Env.AWS_REGION,
        Env.AWS_ACCOUNT_ID,
        name_space,
        user_name,
    )

    res = get_quicksight_client().get_dashboard_embed_url(
        AwsAccountId=Env.AWS_ACCOUNT_ID,
        DashboardId=dashboard_id,
        IdentityType='QUICKSIGHT',
        SessionLifetimeInMinutes=600,
        UserArn=user_arn,
        Namespace=name_space,
    )
    return Response(200, 'application/json', json.dumps({'EmbedUrl': res['EmbedUrl']}, separators=(',', ':')))


@app.get('/quicksight', cache_control='max-age=0')
def get_handler():
    return get_embed_url(app.current_event)


@logger.inject_lambda_context(correlation_id_path=API_GATEWAY_REST, clear_state=True)
def lambda_handler(event: dict[str, Any], context: LambdaContext):
    return app.resolve(event, context)
