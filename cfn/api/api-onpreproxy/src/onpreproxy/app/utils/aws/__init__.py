from __future__ import annotations

from functools import lru_cache

import boto3
import decouple
from botocore.config import Config

config = Config({'mode': 'standard'})
region: str = decouple.config('AWS_REGION', cast=str, default='')


@lru_cache
def get_s3_resource(region_name: str = region):
    return boto3.resource('s3', region_name=region_name, config=config)


@lru_cache
def get_dynamodb_resource(region_name: str = region):
    return boto3.resource('dynamodb', region_name=region_name, config=config)


@lru_cache
def get_quicksight_client(region_name: str = region):
    return boto3.client('quicksight', region_name=region_name, config=config)
