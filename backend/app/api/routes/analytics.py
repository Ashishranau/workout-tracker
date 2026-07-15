from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.analytics import OneRepMaxRequest, OneRepMaxResponse
from app.services.analytics import estimate_one_rep_max

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
