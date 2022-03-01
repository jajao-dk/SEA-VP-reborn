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

from .utils.aws import get_s3_resource, s3
from .utils.handler import api_handler
from .values import Env

logger = Logger()
app = ApiGatewayResolver(ProxyEventType.APIGatewayProxyEvent)


def check_user(event: APIGatewayProxyEvent, claims: dict[str, Any], user: dict[str, Any]):
    params: dict[str, str] = event.path_parameters
    return params['customer_id'] in user.get('customer_ids', [])


@api_handler(validation_handler=check_user)
def get_object(event: APIGatewayProxyEvent):
    try:
        obj = get_s3_resource().Object(Env.DATA_BUCKET_NAME, event.request_context.path.lstrip('/'))
        body, content_type, headers = s3.get_object(obj)

        return Response(200, content_type, body, headers)
    except ClientError as error:
        code = error.response['Error']['Code']
        if code in ['NoSuchKey', 'AccessDenied']:
            return Response(404, 'text/plain', 'NotFound')

        raise error


@app.get('.+')
def get_handler():
    return get_object(app.current_event)


@logger.inject_lambda_context(correlation_id_path=API_GATEWAY_REST, clear_state=True)
def lambda_handler(event: dict[str, Any], context: LambdaContext):
    return app.resolve(event, context)
