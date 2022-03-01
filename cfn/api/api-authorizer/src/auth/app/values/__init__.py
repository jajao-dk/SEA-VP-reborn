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
    USER_TABLE_NAME = get_env('USER_TABLE_NAME', str)
    CLOUDFRONT_PUBLIC_KEY_ID = get_env('CLOUDFRONT_PUBLIC_KEY_ID', str)
    RSA_PARAMETER_NAME = get_env('RSA_PARAMETER_NAME', str)
    COOKIE_EXPIRES_IN = get_env('COOKIE_EXPIRES_IN', int)
    RESPONSE_KEYS = list(filter(lambda el: el != '', [el.strip() for el in get_env('RESPONSE_KEYS', str, '').split(',')]))


Const = ConstType()
Env = EnvType()
