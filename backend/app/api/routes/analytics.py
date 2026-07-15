from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.analytics import OneRepMaxRequest, OneRepMaxResponse, PlateauResponse
from app.services.analytics import analyze_plateau, estimate_one_rep_max

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post("/one-rep-max", response_model=OneRepMaxResponse)
def one_rep_max(
    request: OneRepMaxRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        return estimate_one_rep_max(request.weight_kg, request.reps)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/plateau/{exercise_id}", response_model=PlateauResponse)
def plateau(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return analyze_plateau(db, current_user.id, exercise_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
