from __future__ import annotations

import json
from collections import Callable
from functools import partial, wraps
from typing import Any

from aws_lambda_powertools.event_handler.api_gateway import Response
from aws_lambda_powertools.utilities.data_classes import APIGatewayProxyEvent


def check_user(event: APIGatewayProxyEvent, claims: dict[str, Any], user: dict[str, Any]):
    params: dict[str, str] = event.path_parameters
    return params['customer_id'] in user.get('customer_ids', [])


def api_handler(func: Callable[[APIGatewayProxyEvent], Response] | None = None):
    if func is None:
        return partial(api_handler)

    @wraps(func)
    def wrapper(event: APIGatewayProxyEvent):
        authorizer = event.request_context.authorizer
        claims = json.loads(authorizer['claims'])
        user = json.loads(authorizer['user'])
        if not check_user(event, claims, user):
            return Response(403, 'text/plain', 'Forbidden')

        event['requestContext']['authorizer']['claims'] = claims
        event['requestContext']['authorizer']['user'] = user
        return func(event)

    return wrapper
