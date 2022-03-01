from __future__ import annotations

from typing import Any, BinaryIO, TextIO, TypedDict


class PutObjectConfig(TypedDict, total=False):
    cache_control: str | None
    content_encoding: str | None
    content_type: str


def get_object(obj: Any):
    res = obj.get()
    return res['Body'].read()


def put_object(
    data: str | bytes | TextIO | BinaryIO,
    obj: Any,
    conf: PutObjectConfig,
    **kwargs: Any,
):
    d = data
    if isinstance(d, str):
        d = d.encode()

    obj.put(Body=d, **{**{to_camel_case(key): val for key, val in conf.items()}, **kwargs})


def to_camel_case(value: str):
    return ''.join(el.capitalize() for el in value.split('_'))
