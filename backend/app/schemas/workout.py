from datetime import date as date_
from datetime import datetime

from pydantic import BaseModel


class WorkoutSetCreate(BaseModel):
    exercise_id: int
    set_number: int
    weight_kg: float
    reps: int
    rpe: float | None = None


class WorkoutSetUpdate(BaseModel):
    exercise_id: int | None = None
    weight_kg: float | None = None
    reps: int | None = None
    rpe: float | None = None


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