from pydantic import BaseModel, Field

from app.models.exercise import ExerciseCategory


class ExerciseCreate(BaseModel):
    model_config = {"str_strip_whitespace": True}

    name: str = Field(min_length=1, max_length=100)
    category: ExerciseCategory
    primary_muscle_group: str | None = Field(default=None, max_length=50)


class ExerciseRead(BaseModel):
    id: int
    name: str
    category: ExerciseCategory
    primary_muscle_group: str | None
    is_custom: bool

    class Config:
        from_attributes = True
