from __future__ import annotations

import json
from collections import Callable
from functools import partial, wraps
from typing import Any

from aws_lambda_powertools.event_handler.api_gateway import Response
from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.middleware_factory import lambda_handler_decorator
from aws_lambda_powertools.utilities.data_classes import (APIGatewayProxyEvent,
                                                          EventBridgeEvent)
from aws_lambda_powertools.utilities.data_classes.sns_event import SNSMessage
from aws_lambda_powertools.utilities.typing import LambdaContext
from pandas import Timedelta, Timestamp

logger = Logger(child=True)


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
            if validation_handler is not None and not validation_handler(event, claims, user):
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


def stock_handler(
    func: Callable[[str], None] | None = None,
    delta: Timedelta | None = Timedelta(1, 'H'),
    bucket_name: str = 'wni-wfc-stock-ane1',
    error_handler: Callable[[Exception], None] | None = None,
):

    if func is None:
        return partial(stock_handler, delta, bucket_name)

    @wraps(func)
    def wrapper(record: Any):
        try:
            sns = SNSMessage({'Sns': json.loads(record.body)})
            message = 's3://{0}/{1}'.format(bucket_name, sns.message)
            if delta is None:
                func(message)
                return

            [_, name] = message.rsplit('/', 1)
            date = Timestamp(name.split('.')[0], tz='UTC')
            timestamp = Timestamp(sns.timestamp)

            if date >= timestamp - delta:
                func(message)
            else:
                logger.info({'skip': message})
        except Exception as e:
            if error_handler is not None:
                error_handler(e)
            else:
                logger.exception(e)
                raise e

    return wrapper


def schedule_handler(
    func: Callable[[Timestamp], None] | None = None,
    tz: str = 'Asia/Tokyo',
    error_handler: Callable[[Exception], None] | None = None,
):

    if func is None:
        return partial(schedule_handler)

    @wraps(func)
    def wrapper(record: Any):
        try:
            event = EventBridgeEvent(json.loads(record.body))
            return func(Timestamp(event.time).tz_convert(tz))
        except Exception as e:
            if error_handler is not None:
                error_handler(e)
            else:
                logger.exception(e)
                raise e

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
