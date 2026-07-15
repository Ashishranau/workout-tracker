from datetime import date, datetime

from pydantic import BaseModel, Field


class BodyweightLogCreate(BaseModel):
    date: date
    weight_kg: float = Field(gt=0, le=500)


class BodyweightLogRead(BodyweightLogCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
