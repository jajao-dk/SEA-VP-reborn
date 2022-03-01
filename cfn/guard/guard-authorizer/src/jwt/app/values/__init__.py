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
    AUTH0_ISSUER = get_env('AUTH0_ISSUER', str)
    AUTH0_AUDIENCE = get_env('AUTH0_AUDIENCE', str)
    USER_TABLE_NAME = get_env('USER_TABLE_NAME', str)
    FILTER_COLUMNS = list(filter(lambda el: el != '', [el.strip() for el in get_env('FILTER_COLUMNS', str, '').split(',')]))


Const = ConstType()
Env = EnvType()
