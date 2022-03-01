from __future__ import annotations

import json
from typing import Any

from aws_lambda_powertools.event_handler.api_gateway import (
    ApiGatewayResolver, ProxyEventType, Response)
from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.logging.correlation_paths import API_GATEWAY_REST
from aws_lambda_powertools.utilities.data_classes import APIGatewayProxyEvent
from aws_lambda_powertools.utilities.typing import LambdaContext

from .utils.handler import api_handler

logger = Logger()
app = ApiGatewayResolver(ProxyEventType.APIGatewayProxyEvent, strip_prefixes=['/v1'])


def check_user(event: APIGatewayProxyEvent, claims: dict[str, Any], user: dict[str, Any]) -> bool:
    # TODO: サービスを利用して良いUserIDかチェックする
    return claims['sub'].startswith('google-apps|')


@api_handler(validation_handler=check_user)
def call_hello(event: APIGatewayProxyEvent):
    return Response(200, 'application/json', json.dumps({'message': 'Hello, World!'}, separators=(',', ':')))


@app.get('/hello', cache_control='max-age=0')
def get_handler():
    return call_hello(app.current_event)


@logger.inject_lambda_context(correlation_id_path=API_GATEWAY_REST, clear_state=True)
def lambda_handler(event: dict[str, Any], context: LambdaContext):
    return app.resolve(event, context)
