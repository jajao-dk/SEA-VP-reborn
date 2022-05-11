from __future__ import annotations

from typing import Any

from aws_lambda_powertools.event_handler.api_gateway import (
    ApiGatewayResolver, ProxyEventType, Response)
from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.logging.correlation_paths import API_GATEWAY_REST
from aws_lambda_powertools.utilities.data_classes.api_gateway_proxy_event import \
    APIGatewayProxyEvent
from aws_lambda_powertools.utilities.typing import LambdaContext
from botocore.exceptions import ClientError

from .utils.handler import api_handler
from .values import Env

logger = Logger()
app = ApiGatewayResolver(ProxyEventType.APIGatewayProxyEvent)

@api_handler()
def get_content(event: APIGatewayProxyEvent):
    try:
        return Response(200, 'text/plain', 'OK')
    except ClientError as error:
        code = error.response['Error']['Code']
        if code in ['NoSuchKey', 'AccessDenied']:
            return Response(404, 'text/plain', 'NotFound')

        raise error


@app.get('.+')
def get_handler():
    return get_content(app.current_event)


@logger.inject_lambda_context(correlation_id_path=API_GATEWAY_REST, clear_state=True)
def lambda_handler(event: dict[str, Any], context: LambdaContext):
    return app.resolve(event, context)
