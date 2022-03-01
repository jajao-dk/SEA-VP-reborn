from __future__ import annotations

from io import BytesIO, StringIO
from typing import Any

import awswrangler as wr
import pandas as pd
from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.utilities.batch import (BatchProcessor, EventType,
                                                   batch_processor)
from aws_lambda_powertools.utilities.typing import LambdaContext

from .utils.aws import get_s3_resource, s3
from .utils.handler import stock_handler
from .values import Env

logger = Logger()
processor = BatchProcessor(event_type=EventType.SQS)


def put_s3(source_uri: str):
    with BytesIO() as f:
        wr.s3.download(source_uri, f)
        data = f.getvalue()

    [_, data] = data.split(b'\x04\x1a', 1)
    data = pd.read_xml(data)
    with StringIO() as f:
        data.to_csv(f, index=False)
        data = data.getvalue()

    obj = get_s3_resource().Object(Env.DATA_BUCKET_NAME, 'customer/WNI/holiday/latest.csv')
    s3.put_object(data, obj, {'content_type': 'text/csv', 'cache_control': 'max-age=60'})


@stock_handler
def record_handler(uri: str):
    put_s3(uri)


@logger.inject_lambda_context(clear_state=True)
@batch_processor(record_handler=record_handler, processor=processor)
def lambda_handler(event: dict[str, Any], context: LambdaContext):
    return {'statusCode': 200}
