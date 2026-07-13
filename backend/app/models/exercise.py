import enum

from sqlalchemy import Column, Enum, Integer, String

from app.database import Base


class ExerciseCategory(str, enum.Enum):
    barbell = "barbell"
    dumbbell = "dumbbell"
    bodyweight = "bodyweight"
    machine = "machine"


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    category = Column(Enum(ExerciseCategory), nullable=False)
    primary_muscle_group = Column(String, nullable=True)