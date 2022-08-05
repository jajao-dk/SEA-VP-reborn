from __future__ import annotations

import gzip
from typing import Any, Optional

import numpy as np
import pandas as pd
from pandas import Timestamp

from .RU import (ArrayType, FormatParser, ScalarType, StringType, StructType,
                 Type)

DTYPE_MAPPING = {'!f': '>f4', '!d': '>f8', 'b': 'i1', '!h': '>i2', '!l': '>i4', 'B': '>u1', '!H': '>u2', '!L': '>u4'}


def parse_ru(ru_data: bytes, encoding: str = '') -> tuple[Optional[dict[str, str]], Optional[dict[str, Any]]]:
    components = ru_data.split(b'\x04\x1a', 1)
    if len(components) < 2:
        return None, None

    headers = get_ru_header(components[0])
    if 'format' not in headers:
        return None, None
    data = components[1]
    if 'compress_type' in headers:
        if headers['compress_type'] == 'gzip':
            data = gzip.decompress(data)

    root, ret = FormatParser().parse(headers['format']), {}
    dump_body(root[0], data, ret, encoding)
    return headers, ret.get('/', {})


def get_ru_header(header: bytes):
    ret: dict[str, str] = {}
    for el in header.decode('utf-8').splitlines():
        if '=' not in el:
            continue

        [key, val] = el.split('=', 1)
        ret[key] = val

    return ret


def dump_body(ru: Type, data: bytes, ret: dict[str, Any] = {}, encoding: str = '') -> bytes:
    if isinstance(ru, StructType):
        if ru.is_time():
            dt, size = get_dtype(ru)
            try:
                ret[ru.name] = Timestamp(*next(iter(np.frombuffer(data[:size], dt)), pd.NaT))
            except:
                ret[ru.name] = pd.NaT
            return data[size:]

        tmp, buf = {}, data
        for el in ru.members:
            buf = dump_body(el, buf, tmp, encoding)

        if ru.name == '':
            ret.update(tmp)
        else:
            ret[ru.name] = tmp
        return buf

    elif isinstance(ru, ArrayType):
        if ru.size not in ret:
            return data

        length = ret[ru.size]
        dt, size = get_dtype(ru.member)
        if dt is None:
            _ret, buf = [], data
            for el in range(length):
                tmp = {}
                buf = dump_body(ru.member, buf, tmp, encoding)
                _ret.append(tmp)
            ret[ru.name] = _ret
            return buf

        buf = length * size
        ret[ru.name] = np.frombuffer(data[:buf], dt).byteswap().newbyteorder()
        return data[buf:]

    elif isinstance(ru, StringType):
        components = data.split(b'\x00', 1)
        if len(components) < 2:
            return data

        ret[ru.name] = components[0].decode(encoding or ru.get_encoding())
        return components[1]

    if ru.format not in DTYPE_MAPPING:
        return data

    ret[ru.name] = next(iter(np.frombuffer(data[:ru.size], DTYPE_MAPPING[ru.format])), np.nan)
    return data[ru.size:]


def get_dtype(ru: StructType) -> tuple[Optional[list[tuple[str, str]]], int]:
    dt, size = [], 0
    for el in ru.members:
        if isinstance(el, StructType):
            if not el.is_time():
                return None, -1

            _dt, _size = get_dtype(el)
            dt.extend([(check_name(dt, n), d) for n, d in _dt or []])
            size += _size

        else:
            if not isinstance(el, ScalarType) or el.format not in DTYPE_MAPPING:
                return None, -1

            dt.append((check_name(dt, el.name), DTYPE_MAPPING[el.format]))
            size += el.size

    return dt, size


def check_name(dt: list[tuple[str, str]], name: str):
    duplicated = [el for el in dt if el[0] == name]
    return name if len(duplicated) <= 0 else '{0}{1}'.format(name, len(duplicated) + 1)
