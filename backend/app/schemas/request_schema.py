from pydantic import BaseModel
from typing import Optional


class CitizenRequest(BaseModel):
    text: str
    language: str = "en"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    district: Optional[str] = None
    state: Optional[str] = None