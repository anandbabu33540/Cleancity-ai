from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReportCreate(BaseModel):
    image_path: str
    waste_type: str
    confidence: float
    category: str
    severity: str
    latitude: float
    longitude: float
    description: Optional[str] = ""
    address: Optional[str] = "Unknown"

class ReportOut(ReportCreate):
    id: int
    report_id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
