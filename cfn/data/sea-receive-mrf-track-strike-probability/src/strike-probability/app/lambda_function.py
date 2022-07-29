from __future__ import annotations

import datetime
import json
from io import BytesIO
from typing import Any

import awswrangler as wr
import boto3
import pandas as pd
from aws_lambda_powertools import Logger
from aws_lambda_powertools.utilities.data_classes import SQSEvent
from aws_lambda_powertools.utilities.data_classes.sns_event import SNSMessage
from aws_lambda_powertools.utilities.data_classes.sqs_event import SQSRecord
from aws_lambda_powertools.utilities.typing import LambdaContext

from app.ru.parser import get_ru_header
from app.utils.misc import typed_sqs_batch_processor
from app.values import const, env

logger = Logger()


def get_headers_and_dictdata(b_data):
    # 今回扱うデータがru headerつきjsonという特殊フォーマットのため、
    # 独自処理(とはいってもparse_ruのコピー)を実装
    components = b_data.split(b'\x04\x1a', 1)
    if len(components) < 2:
        return None, None

    headers = get_ru_header(components[0])
    if 'format' not in headers:
        return None, None

    data = components[1]
    dictdata = json.loads(data)
    return headers, dictdata


def ru_to_json(data_source_uri: str):
    # stock on s3 からデータ取得・読み込み
    with BytesIO() as f:
        wr.s3.download(path=data_source_uri, local_file=f)
        return get_headers_and_dictdata(f.getvalue())


def pickup_gplc_id(headers):
    """
    pick up GPLC_ID, Display data
    """
    gplc_id = headers['header_comment'].split('_')[1]
    return gplc_id


def create_history_file_name(headers):
    """
    pick up forecast time and change to jst time
    history data
    """
    # 時差を考慮してYYYYMMDDhhmmフォーマットで出力
    announcetime = headers['announced'][:19]
    utc_time = pd.Timestamp(announcetime)
    gplc_id = pickup_gplc_id(headers)
    history_file_name = gplc_id + '_' + utc_time.strftime('%Y%m%d%H%M')
    return history_file_name


def upload_to_s3(bucketname, filename, dictdata):
    """
    create geojson file and writes data to the file
    -> upload to s3
    """
    s3 = boto3.resource('s3')
    s3object = s3.Object(bucketname, filename)
    s3object.put(Body=json.dumps(dictdata), ContentType='application/json', CacheControl='max-age=60')


def record_handler(record: SQSRecord):
    """
    SQS record handler.

    Args:
        record (SQSRecord): Single SQS record.

    """
    sqs_body = json.loads(record.body)
    sns_message = SNSMessage({'Sns': sqs_body})

    data_source_uri = const.STOCK_ON_S3_URI.format(
        s3_path=sns_message.message
    )
    # 受信データ読み込み
    headers, dictdata = ru_to_json(data_source_uri)
    valid_file = pickup_gplc_id(headers) + '.geojson'
    history_file = create_history_file_name(headers) + '.geojson'

    # 表示用ファイル(valid_file)保存
    upload_to_s3(env.BUCKET, const.KEY + '/valid/' + valid_file, dictdata)
    # historyファイル保存
    upload_to_s3(env.BUCKET, const.KEY + '/history/' + history_file, dictdata)


@logger.inject_lambda_context
@typed_sqs_batch_processor(record_handler=record_handler)
def lambda_handler(event: SQSEvent, context: LambdaContext) -> dict[str, Any]:
    """Lambda handler.

    Args:
        event (SQSEvent): SQS Event.
        context (LambdaContext): Lambda context.

    Returns:
        dict[str, Any]: Lambda response.
    """
    return {'statusCode': 200}
