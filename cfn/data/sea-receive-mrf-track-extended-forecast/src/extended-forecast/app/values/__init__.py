"""Constants and environment variables.
"""
from __future__ import annotations

from typing import NamedTuple, Optional, Type, TypeVar

from decouple import config

T = TypeVar('T', bool, int, str)


def get_env(key: str, cast: Type[T], default: Optional[T] = None) -> T:
    """Wrapper function for `decouple.config()`.
    """
    return config(key, cast=cast, default=default)  # type: ignore


class Const(NamedTuple):
    """User-defined constants.

    Attributes:
    """
    STOCK_ON_S3_URI: str = 's3://wni-wfc-stock-ane1/{s3_path}'
    KEY: str = 'wxdata/typhoon/extended-forecast'


class Env(NamedTuple):
    """User-defined environment variables.

    Attributes:
        BUCKET (str): Name of the S3 bucket.
    """
    BUCKET: str = get_env('BUCKET', str)



const = Const()
env = Env()
