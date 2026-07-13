from datetime import date, datetime

from pydantic import BaseModel


class WorkoutSetCreate(BaseModel):
    exercise_id: int
    set_number: int
    weight_kg: float
    reps: int
    rpe: float | None = None


class WorkoutSetRead(WorkoutSetCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class WorkoutSessionCreate(BaseModel):
    date: date
    notes: str | None = None


class WorkoutSessionRead(WorkoutSessionCreate):
    id: int
    created_at: datetime
    sets: list[WorkoutSetRead] = []

    class Config:
        from_attributes = True