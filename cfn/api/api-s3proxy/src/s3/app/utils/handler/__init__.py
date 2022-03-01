from __future__ import annotations

import json
from collections import Callable
from functools import partial, wraps
from typing import Any

from aws_lambda_powertools.event_handler.api_gateway import Response
from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.middleware_factory import lambda_handler_decorator
from aws_lambda_powertools.utilities.data_classes import APIGatewayProxyEvent
from aws_lambda_powertools.utilities.typing import LambdaContext

logger = Logger(child=True)

def check_user(event: APIGatewayProxyEvent, claims: dict[str, Any], user: dict[str, Any]):
    params: dict[str, str] = event.path_parameters
    logger.debug(f"customer_id in check_user:{params['customer_id']}")
    return params['customer_id'] in user.get('customer_ids', [])

def api_handler(
    func: Callable[[APIGatewayProxyEvent], Response] | None = None,
    validation_handler: Callable[[APIGatewayProxyEvent, dict[str, Any], dict[str, Any]], bool] | None = None,
    error_handler: Callable[[Exception], Response] | None = None,
):

    if func is None:
        return partial(api_handler)

    @wraps(func)
    def wrapper(event: Any):
        try:
            authorizer = event.request_context.authorizer
            claims = json.loads(authorizer['claims'])
            user = json.loads(authorizer['user'])
            if not check_user(event, claims, user):
                return Response(403, 'text/plain', 'Forbidden')

            event['requestContext']['authorizer']['claims'] = claims
            event['requestContext']['authorizer']['user'] = user
            return func(event)
        except Exception as e:
            if error_handler is not None:
                return error_handler(e)
            else:
                logger.exception(e)
                return Response(500, 'text/plain', 'InternalServerError')

    return wrapper


@lambda_handler_decorator
def basic_handler(
    handler: Callable[[Any, LambdaContext], Any],
    event: Any,
    context: LambdaContext,
    error_handler: Callable[[Exception], Any] | None = None,
):

    try:
        return handler(event, context)
    except Exception as e:
        if error_handler is not None:
            return error_handler(e)
        else:
            logger.exception(e)
            raise e
