from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models.bodyweight import BodyweightLog
from app.models.user import User
from app.schemas.bodyweight import BodyweightLogCreate, BodyweightLogRead

router = APIRouter(prefix="/users/me/bodyweight", tags=["bodyweight"])


@router.post("", response_model=BodyweightLogRead, status_code=201)
def log_bodyweight(
    entry: BodyweightLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # One entry per day - logging again for a date you've already logged
    # overwrites it rather than creating a second, ambiguously-ordered row.
    existing = (
        db.query(BodyweightLog)
        .filter(BodyweightLog.user_id == current_user.id, BodyweightLog.date == entry.date)
        .first()
    )
    if existing:
        existing.weight_kg = entry.weight_kg
        db.commit()
        db.refresh(existing)
        return existing

    log = BodyweightLog(user_id=current_user.id, **entry.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("", response_model=list[BodyweightLogRead])
def list_bodyweight(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(BodyweightLog)
        .filter(BodyweightLog.user_id == current_user.id)
        .order_by(BodyweightLog.date.desc())
        .all()
    )
