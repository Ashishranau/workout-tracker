import enum

from sqlalchemy import Column, Enum, ForeignKey, Integer, String

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
    # NULL = official curated catalog entry. Otherwise, a custom exercise
    # visible only to the user who created it.
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    @property
    def is_custom(self) -> bool:
        return self.created_by_user_id is not None