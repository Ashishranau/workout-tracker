from datetime import date as date_
from datetime import datetime

from pydantic import BaseModel, Field


class WorkoutSetCreate(BaseModel):
    exercise_id: int
    set_number: int = Field(gt=0)
    weight_kg: float = Field(gt=0, le=1000)
    reps: int = Field(gt=0, le=200)
    rpe: float | None = Field(default=None, ge=0, le=10)


class WorkoutSetUpdate(BaseModel):
    exercise_id: int | None = None
    weight_kg: float | None = Field(default=None, gt=0, le=1000)
    reps: int | None = Field(default=None, gt=0, le=200)
    rpe: float | None = Field(default=None, ge=0, le=10)


class WorkoutSetRead(WorkoutSetCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class WorkoutSessionCreate(BaseModel):
    date: date_
    notes: str | None = None


class WorkoutSessionUpdate(BaseModel):
    date: date_ | None = None
    notes: str | None = None


class WorkoutSessionRead(WorkoutSessionCreate):
    id: int
    created_at: datetime
    sets: list[WorkoutSetRead] = []

    class Config:
        from_attributes = True
