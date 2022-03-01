from __future__ import annotations

from typing import Any

from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.utilities.batch import (BatchProcessor, EventType,
                                                   batch_processor)
from aws_lambda_powertools.utilities.typing import LambdaContext
from pandas import Timestamp

from .utils.handler import schedule_handler

logger = Logger()
processor = BatchProcessor(event_type=EventType.SQS)


def call_time(time: Timestamp):
    logger.info(time.isoformat())


@schedule_handler
def record_handler(time: Timestamp):
    call_time(time)


@logger.inject_lambda_context(clear_state=True)
@batch_processor(record_handler=record_handler, processor=processor)
def lambda_handler(event: dict[str, Any], context: LambdaContext):
    return {'statusCode': 200}
