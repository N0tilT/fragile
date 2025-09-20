from dataclasses import dataclass
from typing import Optional

@dataclass
class Device:
    id: Optional[int] = None
    name: str = ""
    type: str = ""
    coordinates: str = ""
