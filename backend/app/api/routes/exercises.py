from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models.exercise import Exercise
from app.models.user import User
from app.schemas.exercise import ExerciseCreate, ExerciseRead

router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.get("", response_model=list[ExerciseRead])
def list_exercises(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Exercise)
        .filter(
            or_(
                Exercise.created_by_user_id.is_(None),
                Exercise.created_by_user_id == current_user.id,
            )
        )
        .order_by(Exercise.name)
        .all()
    )


@router.post("", response_model=ExerciseRead, status_code=201)
def create_exercise(
    exercise_in: ExerciseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exercise = Exercise(
        name=exercise_in.name,
        category=exercise_in.category,
        primary_muscle_group=exercise_in.primary_muscle_group,
        created_by_user_id=current_user.id,
    )
    db.add(exercise)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="An exercise with this name already exists")
    db.refresh(exercise)
    return exercise
