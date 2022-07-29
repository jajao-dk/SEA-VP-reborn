from __future__ import annotations

import numpy as np
from pandas import Series


def round_row(row: Series[np.int16 | np.int32 | np.float32], decimals: int) -> Series[np.int16 | np.int32 | np.float32]:
    add, digit = np.where(row >= 0, np.float32(0.5), np.float32(-0.4)) * (0.1 ** decimals), 10 ** decimals
    return Series(Series((row + add) * digit, dtype='Float32').astype('Int32') / digit, dtype=row.dtype)
