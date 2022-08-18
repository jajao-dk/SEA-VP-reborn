import json
import os
from typing import Any

import app.lambda_function as func
import boto3
import pandas as pd
import pytest
from app.values import env
from moto import mock_s3


@pytest.mark.parametrize(
    'headers, expected',
    [
        (
            {'announced': '2022/04/04 18:00:00 GMT', 'created': '2022/04/05 00:11:07 GMT', 'header_version': '1.00', 'revision': '1', 'data_name': 'WNI_MRF_TRACK_PROB_polygon', 'global_id': '0200', 'category': '6000', 'data_id': '11024694', 'data_size': '189615', 'format': 'GEOJSON:+INT8', 'header_comment': 'prob_GPLC2022023SHSP_20220404.18_20220404.12.json'},
            'GPLC2022023SHSP'
        )
    ]
)
def test_pickup_gplc_id(headers: dict[str, Any], expected: str):
    result = func.pickup_gplc_id(headers)
    assert result == expected


@pytest.mark.parametrize(
    'headers, expected',
    [
        (
            {'announced': '2022/04/04 18:00:00 GMT', 'created': '2022/04/05 00:11:07 GMT', 'header_version': '1.00', 'revision': '1', 'data_name': 'WNI_MRF_TRACK_PROB_polygon', 'global_id': '0200', 'category': '6000', 'data_id': '11024694', 'data_size': '189615', 'format': 'GEOJSON:+INT8', 'header_comment': 'prob_GPLC2022023SHSP_20220404.18_20220404.12.json'},
            'GPLC2022023SHSP_202204041800'
        )
    ]
)
def test_create_history_file_name(headers: dict[str, Any], expected: str):
    result = func.create_history_file_name(headers)
    assert result == expected


@pytest.mark.parametrize(
    'inputfilename, expected_headers ,expected_dictdata',
    [
        (
            'common',
            {
                "announced": "2022/04/04 18:00:00 GMT",
                "created": "2022/04/05 00:11:07 GMT",
                "header_version": "1.00",
                "revision": "1",
                "data_name": "WNI_MRF_TRACK_PROB_polygon",
                "global_id": "0200",
                "category": "6000",
                "data_id": "11024694",
                "data_size": "189615",
                "format": "GEOJSON:+INT8",
                "header_comment": "prob_GPLC2022023SHSP_20220404.18_20220404.12.json"
            },
            {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "properties": {
                            "value": "5-10",
                            "content": 5
                        },
                        "geometry": {
                            "type": "MultiPolygon",
                            "coordinates": [
                                [

                                    {
                                        "type": "Feature",
                                        "properties": {
                                            "value": "60-70",
                                            "content": 60
                                        },
                                        "geometry": {
                                            "type": "MultiPolygon",
                                            "coordinates": [
                                                [
                                                    [
                                                        [
                                                            163.4,
                                                            -23.558
                                                        ],
                                                        [
                                                            163.381,
                                                            -23.5
                                                        ],
                                                        [
                                                            163.378,
                                                            -23.4
                                                        ],
                                                        [
                                                            163.365,
                                                            -23.3
                                                        ],
                                                        [
                                                            163.3,
                                                            -23.24
                                                        ]
                                                    ]
                                                ]
                                            ]
                                        }
                                    }
                                ]
                            ]

                        }


                    }
                ]

            }

        ),
        (
            'cannotbesplit',
            None,
            None
        ),
        (
            'noformat',
            None,
            None
        )
    ]
)
def test_get_headers_and_dictdata(inputfilename: str, expected_headers: dict[str, Any], expected_dictdata: dict[str, Any]):

    with open(os.path.dirname(__file__) + f'/testdata/{inputfilename}.txt', 'rb') as f:
        b_data = f.read()
    headers, dictdata = func.get_headers_and_dictdata(b_data)
    assert headers == expected_headers
    assert dictdata == expected_dictdata


@pytest.fixture()
def create_mock_s3():
    '''Create mock s3 to store test data.
    '''
    region_name = 'ap-northeast-1'
    bucket_name = env.RECEIVE_BUCKET

    with mock_s3():
        s3 = boto3.resource('s3')
        s3.create_bucket(
            Bucket=bucket_name,
            CreateBucketConfiguration={'LocationConstraint': region_name},
        )
        yield bucket_name


@pytest.mark.parametrize(
    'filename, data',
    [
        (
            'valid/GPLC2022023SHSP.geojson',
            'strike-probability-test.geojson'
        ),
        (
            'history/GPLC2022023SHSP_202204041800.geojson',
            'strike-probability-test.geojson'
        )
    ]
)
def test_upload_to_s3(create_mock_s3, filename, data):
    '''
    Check if file (with correct unixtime) exists.

    '''
    with open(os.path.dirname(__file__) + f'/testdata/{data}', 'r') as f:
        dictdata = f.read()
    bucket_name = create_mock_s3
    func.upload_to_s3(bucket_name, filename, dictdata)

    # 保存されたデータを読んできてテスト
    s3 = boto3.resource('s3')
    response = s3.Bucket(bucket_name).Object(filename).get()
    body = response['Body'].read()
    saved_data = json.loads(body.decode('utf-8'))

    # 保存前のdictと一致しているか調べる
    assert saved_data == dictdata
