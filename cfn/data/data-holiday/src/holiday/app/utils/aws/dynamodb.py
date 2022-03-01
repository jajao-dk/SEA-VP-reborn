from __future__ import annotations

from collections import Callable, Iterator
from typing import Any


def get_item(table: Any, key: dict[str, Any], **kwargs: Any) -> dict[str, Any] | None:
    res = table.get_item(**{'Key': key, **kwargs})
    return res.get('Item')


def get_items(table: Any, **kwargs: Any) -> Iterator[dict[str, Any]]:
    for el in iter_table(table.query, **kwargs):
        yield el


def iter_table(func: Callable[[Any], Any], **kwargs: Any) -> Iterator[dict[str, Any]]:
    input = {**kwargs}
    while True:
        res = func(**input)
        for el in res.get('Items', []):
            yield el

        if 'LastEvaluatedKey' not in res:
            break
        input['ExclusiveStartKey'] = res['LastEvaluatedKey']
