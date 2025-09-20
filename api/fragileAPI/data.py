from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class Data:
    id: Optional[int] = None
    device_id: int = 0
    value: float = 0.0
    datetime: datetime = None