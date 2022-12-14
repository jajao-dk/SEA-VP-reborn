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
            {'announced': '2022/04/06 18:00:00 GMT', 'created': '2022/04/07 00:06:36 GMT', 'header_version': '1.00', 'revision': '1', 'data_name': 'WNI_MRF_TRACK_GEOJSN', 'global_id': '0200', 'category': '6000', 'data_id': '11024695', 'data_size': '13443', 'format': 'GEOJSON:+INT8', 'header_comment': 'exfcst_GPLC2022023SHSP_20220406.18_20220406.12.json'},
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
            {
                'announced': '2022/04/06 18:00:00 GMT',
                'created': '2022/04/07 00:06:36 GMT',
                'header_version': '1.00',
                'revision': '1',
                'data_name': 'WNI_MRF_TRACK_GEOJSN',
                'global_id': '0200',
                'category': '6000',
                'data_id': '11024695',
                'data_size': '13443',
                'format': 'GEOJSON:+INT8',
                'header_comment': 'exfcst_GPLC2022023SHSP_20220406.18_20220406.12.json'
            },
            'GPLC2022023SHSP_202204061800'
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
                'announced': '2022/04/06 18:00:00 GMT',
                'created': '2022/04/07 00:06:36 GMT',
                'header_version': '1.00',
                'revision': '1',
                'data_name': 'WNI_MRF_TRACK_GEOJSN',
                'global_id': '0200',
                'category': '6000',
                'data_id': '11024695',
                'data_size': '13443',
                'format': 'GEOJSON:+INT8',
                'header_comment': 'exfcst_GPLC2022023SHSP_20220406.18_20220406.12.json'
            },
            {
                'features': [
                    {
                        'geometry': {
                            'coordinates': [
                                '163.9',
                                '-21.6'
                            ],
                            'type': 'Point'
                        },
                        'properties': {
                            'FT': '0',
                            'GPLC_ID': 'GPLC2022023SHSP',
                            'basetime': '20220406.12',
                            'valid_tm': 1649268000
                        },
                        'type': 'Feature'
                    }
                ],
                'type': 'FeatureCollection'
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
            'extend-forecast-test.geojson'
        ),
        (
            'history/GPLC2022023SHSP_202204061800.geojson',
            'extend-forecast-test.geojson'
        )
    ]
)
def test_upload_to_s3(create_mock_s3, filename, data):
    '''
    Check if file (with correct unixtime) exists.

    '''
    with open(os.path.dirname(__file__) + f'/testdata/{data}', 'r') as f:
        dict_data = f.read()
    bucket_name = create_mock_s3
    func.upload_to_s3(bucket_name, filename, dict_data)

    # ???????????????????????????????????????????????????
    s3 = boto3.resource('s3')
    response = s3.Bucket(bucket_name).Object(filename).get()
    body = response['Body'].read()
    saved_data = json.loads(body.decode('utf-8'))
    # ????????????dict?????????????????????????????????
    assert saved_data == dict_data


@pytest.mark.parametrize(
    'valid_tm, expected',
    [
        (1657152193, '7???(???)9???'),
        (1657292400, '9???(???)0???'),
        (1657292399, '8???(???)23???')
    ],
    ids=['common case', 'midnight(JST)', 'border(midnight(JST))']
)
def test_create_datelabel(valid_tm, expected):
    assert func.create_datelabel(valid_tm) == expected


@pytest.mark.parametrize(
    'lon, lat, e_lonstr, e_latstr',
    [
        (
            '-0.1', '-0.2', '?????? 0???6???', '?????? 0???12???'
        ),
        (
            '1.5', '-1.6', '?????? 1???30???', '?????? 1???36???',
        ),
        (
            '50.7', '40.8', '?????? 50???42???', '?????? 40???48???',
        ),
        (
            '-40.3', '50.4', '?????? 40???18???', '?????? 50???24???',
        ),
        (
            '359.9', '25.0', '?????? 0???6???', '?????? 25???0???'
        ),
        (
            '180.1', '25.0', '?????? 179???54???', '?????? 25???0???'
        ),
        (
            '180.0', '25.0', '?????? 180???0???', '?????? 25???0???'
        ),

        (
            '-179.9', '25.0', '?????? 179???54???', '?????? 25???0???'
        ),
        (
            '-180.0', '25.0', '?????? 180???0???', '?????? 25???0???'
        ),
        (
            '360.0', '25.0', '?????? 0???0???', '?????? 25???0???'
        )
    ],
    ids=['w,s', 'e,s', 'e,n', 'w,n', 'w(>180, max),n', 'w(>180, min), n', 'e(border),n', 'w(<0,min), n', 'e(-180), n', 'e(360),n']
)
def test_create_lonlatlabels(lon, lat, e_lonstr, e_latstr):
    lonstr, latstr = func.create_lonlatlabels(lon, lat)
    assert lonstr == e_lonstr
    assert latstr == e_latstr


@pytest.mark.parametrize(
    'dictdata, expected',
    [
        (
            {
                "features": [
                    {
                        "geometry": {
                            "coordinates": [
                                "254.8",
                                "15.5"
                            ],
                            "type": "Point"
                        },
                        "properties": {
                            "FT": "0",
                            "GPLC_ID": "GPLC2022036NAAA",
                            "basetime": "20220705.12",
                            "valid_tm": 1657044000
                        },
                        "type": "Feature"
                    },
                    {
                        "geometry": {
                            "coordinates": [
                                "253.6",
                                "15.8"
                            ],
                            "type": "Point"
                        },
                        "properties": {
                            "FT": "6",
                            "GPLC_ID": "GPLC2022036NAAA",
                            "basetime": "20220705.12",
                            "valid_tm": 1657065600
                        },
                        "type": "Feature"
                    },
                    {
                        "geometry": {
                            "coordinates": [
                                [
                                    "254.8",
                                    "15.5"
                                ],
                                [
                                    "253.6",
                                    "15.8"
                                ]
                            ],
                            "type": "LineString"
                        },
                        "type": "Feature"
                    }
                ],
                "type": "FeatureCollection"
            },
            {
                "features": [
                    {
                        "geometry": {
                            "coordinates": [
                                "254.8",
                                "15.5"
                            ],
                            "type": "Point"
                        },
                        "properties": {
                            "FT": "0",
                            "GPLC_ID": "GPLC2022036NAAA",
                            "basetime": "20220705.12",
                            "valid_tm": 1657044000,
                            "label": "6???(???)3???",
                            "latstr": "?????? 15???30???",
                            "lonstr": "?????? 105???12???"
                        },
                        "type": "Feature"
                    },
                    {
                        "geometry": {
                            "coordinates": [
                                "253.6",
                                "15.8"
                            ],
                            "type": "Point"
                        },
                        "properties": {
                            "FT": "6",
                            "GPLC_ID": "GPLC2022036NAAA",
                            "basetime": "20220705.12",
                            "valid_tm": 1657065600,
                            "label": "6???(???)9???",
                            "latstr": "?????? 15???48???",
                            "lonstr": "?????? 106???24???"
                        },
                        "type": "Feature"
                    },
                    {
                        "geometry": {
                            "coordinates": [
                                [
                                    "254.8",
                                    "15.5"
                                ],
                                [
                                    "253.6",
                                    "15.8"
                                ]
                            ],
                            "type": "LineString"
                        },
                        "type": "Feature"
                    }
                ],
                "type": "FeatureCollection"
            }

        )
    ]
)
def test_add_labels(dictdata, expected):
    assert func.add_labels(dictdata) == expected
