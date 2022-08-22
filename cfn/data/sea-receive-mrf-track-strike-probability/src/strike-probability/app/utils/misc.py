from __future__ import annotations

from typing import Any, Callable

from aws_lambda_powertools.utilities.batch import sqs_batch_processor
from aws_lambda_powertools.utilities.data_classes.sqs_event import SQSRecord
from aws_lambda_powertools.utilities.typing import LambdaContext

__all__ = ['typed_sqs_batch_processor']


def typed_sqs_batch_processor(record_handler: Callable[..., Any]) -> Callable[..., Any]:
    """Decorator function to make `sqs_batch_processor()` compatible with `SQSRecord`.

    Args:
        record_handler (Callable[..., Any]): Record handler.

    Returns:
        Callable[..., Any]: Decorator function.
    """
    def decorator(lambda_handler: Callable[..., Any]) -> Callable[..., Any]:
        def wrapper(event: dict[str, Any], context: LambdaContext) -> Any:
            sqs_event = dict(event)
            sqs_records = [SQSRecord(record) for record in event['Records']]
            sqs_event['Records'] = sqs_records

            decorated_handler = sqs_batch_processor(record_handler=record_handler)(lambda_handler)  # type: ignore
            return decorated_handler(sqs_event, context)
        return wrapper
    return decorator
