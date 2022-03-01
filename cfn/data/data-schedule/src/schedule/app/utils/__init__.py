from __future__ import annotations

import json
from collections import Callable
from functools import partial, wraps
from typing import Any

from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.utilities.data_classes import EventBridgeEvent
from aws_lambda_powertools.utilities.data_classes.sqs_event import SQSRecord

logger = Logger(child=True)


def schedule_handler(func: Callable[[Any], None] | None = None):
    if func is None:
        return partial(schedule_handler)

    @wraps(func)
    def wrapper(record: SQSRecord):
        try:
            event = EventBridgeEvent(json.loads(record.body))
            return func(event.time)
        except Exception as e:
            logger.exception(e)
            raise e

    return wrapper
