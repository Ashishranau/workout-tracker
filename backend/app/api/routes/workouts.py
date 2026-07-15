from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.workout import WorkoutSession, WorkoutSet
from app.schemas.workout import (
    WorkoutSessionCreate,
    WorkoutSessionRead,
    WorkoutSessionUpdate,
    WorkoutSetCreate,
    WorkoutSetRead,
    WorkoutSetUpdate,
)

router = APIRouter(prefix="/sessions", tags=["workouts"])


def _get_owned_session(session_id: int, db: Session, current_user: User) -> WorkoutSession:
    session = (
        db.query(WorkoutSession)
        .options(selectinload(WorkoutSession.sets))
        .filter(WorkoutSession.id == session_id, WorkoutSession.user_id == current_user.id)
        .first()
    )
    if session is None:
        raise HTTPException(status_code=404, detail="Workout session not found")
    return session


def _get_owned_set(session_id: int, set_id: int, db: Session, current_user: User) -> WorkoutSet:
    _get_owned_session(session_id, db, current_user)
    workout_set = (
        db.query(WorkoutSet)
        .filter(WorkoutSet.id == set_id, WorkoutSet.session_id == session_id)
        .first()
    )
    if workout_set is None:
        raise HTTPException(status_code=404, detail="Set not found")
    return workout_set


@router.post("", response_model=WorkoutSessionRead, status_code=201)
def create_session(
    session_in: WorkoutSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = WorkoutSession(user_id=current_user.id, **session_in.model_dump())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("", response_model=list[WorkoutSessionRead])
def list_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(WorkoutSession)
        .options(selectinload(WorkoutSession.sets))
        .filter(WorkoutSession.user_id == current_user.id)
        .order_by(WorkoutSession.date.desc())
        .all()
    )


@router.get("/{session_id}", response_model=WorkoutSessionRead)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_owned_session(session_id, db, current_user)


@router.patch("/{session_id}", response_model=WorkoutSessionRead)
def update_session(
    session_id: int,
    session_in: WorkoutSessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = _get_owned_session(session_id, db, current_user)
    for field, value in session_in.model_dump(exclude_unset=True).items():
        setattr(session, field, value)
    db.commit()
    db.refresh(session)
    return session


@router.delete("/{session_id}", status_code=204)
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = _get_owned_session(session_id, db, current_user)
    db.delete(session)
    db.commit()


@router.post("/{session_id}/sets", response_model=WorkoutSetRead, status_code=201)
def add_set(
    session_id: int,
    set_in: WorkoutSetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_owned_session(session_id, db, current_user)

    workout_set = WorkoutSet(session_id=session_id, **set_in.model_dump())
    db.add(workout_set)
    db.commit()
    db.refresh(workout_set)
    return workout_set


@router.patch("/{session_id}/sets/{set_id}", response_model=WorkoutSetRead)
def update_set(
    session_id: int,
    set_id: int,
    set_in: WorkoutSetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workout_set = _get_owned_set(session_id, set_id, db, current_user)
    for field, value in set_in.model_dump(exclude_unset=True).items():
        setattr(workout_set, field, value)
    db.commit()
    db.refresh(workout_set)
    return workout_set


@router.delete("/{session_id}/sets/{set_id}", status_code=204)
def delete_set(
    session_id: int,
    set_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workout_set = _get_owned_set(session_id, set_id, db, current_user)
    db.delete(workout_set)
    db.commit()
