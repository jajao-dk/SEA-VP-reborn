from __future__ import annotations

import datetime
import json
import math
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


def get_headers_and_dictdata(b_data) -> tuple[dict[str, Any], dict[str, Any]]:
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


def ru_to_json(data_source_uri: str) -> tuple[dict[str, Any], dict[str, Any]]:
    # stock on s3 からデータ取得・読み込み
    with BytesIO() as f:
        wr.s3.download(path=data_source_uri, local_file=f)
        return get_headers_and_dictdata(f.getvalue())


def pickup_gplc_id(headers: dict[str, Any]) -> str:
    """
    pick up GPLC_ID, Display data
    """
    gplc_id = headers['header_comment'].split('_')[1]
    return gplc_id


def create_history_file_name(headers: dict[str, Any]) -> str:
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


def upload_to_s3(bucketname: str, filename: str, dictdata: dict[str, Any]) -> None:
    """
    create geojson file and writes data to the file
    -> upload to s3
    """
    s3 = boto3.resource('s3')
    s3object = s3.Object(bucketname, filename)
    s3object.put(Body=json.dumps(dictdata), ContentType='application/json', CacheControl='max-age=60')


def create_datelabel(valid_tm: int) -> str:
    '''
    create date label in Japanese for tooltip and return it
    '''
    daylist = ['月', '火', '水', '木', '金', '土', '日']
    # 時差を加味して計算 valid_tmの単位はsec
    stmp = pd.Timestamp(
        valid_tm, unit='s',
        tzinfo=datetime.timezone(datetime.timedelta(hours=9)))
    # 曜日を決定
    dayjp = daylist[stmp.day_of_week]
    # あたまのゼロを消して日付ラベル生成
    return stmp.strftime(f'%-d日({dayjp})%-H時')


def create_lonlatlabels(lon: str, lat: str) -> tuple[str, str]:
    '''
    create lat lon labels in Japanese for tooltip and return them
    '''
    # 小数点第一位までのため、10倍値で計算・判定
    lonnum = float(lon) * 10
    lonnum = lonnum % 3600
    latnum = float(lat) * 10
    # 符号を見て緯度経度判定
    nors = '北緯 ' if latnum > 0 else '南緯 '
    eorw = '東経 '
    # 経度の値の範囲を-180<経度<=180にする
    if lonnum > 1800:
        eorw = '西経 '
        lonnum = lonnum - 3600
    # 絶対値になおす
    lonnum = abs(lonnum)
    latnum = abs(latnum)
    # ラベル生成
    lonstr = eorw + str(math.floor(lonnum / 10)) + '度'\
        + str(math.floor(lonnum % 10 * 6)) + '分'
    latstr = nors + str(math.floor(latnum / 10)) + '度'\
        + str(math.floor(latnum % 10 * 6)) + '分'
    return lonstr, latstr


def add_labels(dictdata: dict[str, Any]) -> dict[str, Any]:
    """
    create labels in Japanese for tooltip and add them then return
    """
    for obj in dictdata['features']:
        if obj['geometry']['type'] == 'Point':
            # 日付の日本語ラベル生成
            obj['properties']['label'] = create_datelabel(obj['properties']['valid_tm'])
            # 緯度経度の日本語ラベル生成
            lonstr, latstr = create_lonlatlabels(obj['geometry']['coordinates'][0], obj['geometry']['coordinates'][1])
            obj['properties']['lonstr'] = lonstr
            obj['properties']['latstr'] = latstr
    return dictdata


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
    # ツールチップ用データ生成
    updated_dictdata = add_labels(dictdata)
    valid_file = pickup_gplc_id(headers) + '.geojson'
    history_file = create_history_file_name(headers) + '.geojson'
    # 表示用ファイル(valid_file)保存
    upload_to_s3(env.RECEIVE_BUCKET, const.KEY + '/valid/' + valid_file, updated_dictdata)
    # historyファイル保存
    upload_to_s3(env.RECEIVE_BUCKET, const.KEY + '/history/' + pickup_gplc_id(headers) + '/' + history_file, updated_dictdata)


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
