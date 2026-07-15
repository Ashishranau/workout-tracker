from datetime import date, datetime

from pydantic import BaseModel


class BodyweightLogCreate(BaseModel):
    date: date
    weight_kg: float


class BodyweightLogRead(BodyweightLogCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
