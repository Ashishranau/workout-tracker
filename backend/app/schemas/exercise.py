from pydantic import BaseModel

from app.models.exercise import ExerciseCategory


class ExerciseRead(BaseModel):
    id: int
    name: str
    category: ExerciseCategory
    primary_muscle_group: str | None

    class Config:
        from_attributes = True