from pydantic import BaseModel

from app.models.exercise import ExerciseCategory


class ExerciseCreate(BaseModel):
    name: str
    category: ExerciseCategory
    primary_muscle_group: str | None = None


class ExerciseRead(BaseModel):
    id: int
    name: str
    category: ExerciseCategory
    primary_muscle_group: str | None
    is_custom: bool

    class Config:
        from_attributes = True
