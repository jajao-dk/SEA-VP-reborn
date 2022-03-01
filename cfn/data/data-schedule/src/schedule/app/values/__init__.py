from __future__ import annotations

from typing import NamedTuple, Optional, Type, TypeVar

from decouple import config

T = TypeVar('T', bool, int, str)


def get_env(key: str, cast: Type[T], default: Optional[T] = None) -> T:
    return config(key, cast=cast, default=default)  # type: ignore


class ConstType(NamedTuple):
    LATEST_OBJECT_URI: str = 's3://{0}/csv/holiday/latest.csv'


class EnvType(NamedTuple):
    DATA_BUCKET_NAME: str = get_env('DATA_BUCKET_NAME', str)


Const = ConstType()
Env = EnvType()
