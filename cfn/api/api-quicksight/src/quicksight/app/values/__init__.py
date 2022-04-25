from __future__ import annotations

from typing import NamedTuple, Optional, Type, TypeVar

from decouple import config

T = TypeVar('T', bool, int, str)


def get_env(key: str, cast: Type[T], default: Optional[T] = None) -> T:
    return config(key, cast=cast, default=default)  # type: ignore


class ConstType(NamedTuple):
    pass


class EnvType(NamedTuple):
    AWS_REGION = get_env('AWS_REGION', str)
    AWS_ACCOUNT_ID = get_env('AWS_ACCOUNT_ID', str)
    QUICKSIGHT_ENV_PREFIX = get_env('QUICKSIGHT_ENV_PREFIX', str)


Const = ConstType()
Env = EnvType()
