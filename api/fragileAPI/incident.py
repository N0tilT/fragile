from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class Incident:
    id: Optional[int] = None
    name: str = ""
    description: str = ""
    status: str = ""
    coordinates: str = ""
    device_id: int = 0
    datetime: datetime = None,
    value: float = 0,
