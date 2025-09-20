from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class Incident:
    id: Optional[int] = None
    name: str = ""
    description: str = ""
    status: str = ""
    price: float = 0.0
    device_id: int = 0
    datetime: datetime = None