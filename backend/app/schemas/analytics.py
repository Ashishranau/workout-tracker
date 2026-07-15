from pydantic import BaseModel


class OneRepMaxRequest(BaseModel):
    weight_kg: float
    reps: int


class OneRepMaxResponse(BaseModel):
    epley: float
    brzycki: float
    average: float


class PlateauResponse(BaseModel):
    is_plateaued: bool
    slope_per_week: float
    percent_change_per_week: float
    sessions_used: int


class StrengthStandardRequest(BaseModel):
    exercise_id: int
    weight_kg: float
    reps: int


class StrengthStandardResponse(BaseModel):
    tier: str
    bodyweight_ratio: float
    bodyweight_kg: float
    estimated_one_rep_max: float
