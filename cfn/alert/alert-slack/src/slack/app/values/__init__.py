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
    SLACK_OAUTH_TOKEN = get_env('SLACK_OAUTH_TOKEN', str)
    SLACK_CHANNEL_ID = get_env('SLACK_CHANNEL_ID', str)
    SLACK_USER_NAME = get_env('SLACK_USER_NAME', str)
    SLACK_ICON_EMOJI = get_env('SLACK_ICON_EMOJI', str)
    SLACK_ICON_URL = get_env('SLACK_ICON_URL', str)
    ALERT_LEVEL = [el.lower() for el in get_env('ALERT_LEVEL', cast=str).split(',')]
    TIMEZONE = get_env('TIMEZONE', str)


Const = ConstType()
Env = EnvType()
