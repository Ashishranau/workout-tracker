from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sets = relationship(
        "WorkoutSet", back_populates="session", cascade="all, delete-orphan"
    )


class WorkoutSet(Base):
    __tablename__ = "workout_sets"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(
        Integer, ForeignKey("workout_sessions.id"), nullable=False, index=True
    )
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False, index=True)
    set_number = Column(Integer, nullable=False)
    weight_kg = Column(Numeric(6, 2), nullable=False)
    reps = Column(Integer, nullable=False)
    rpe = Column(Numeric(3, 1), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("WorkoutSession", back_populates="sets")
    exercise = relationship("Exercise")