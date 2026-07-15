from datetime import date

from pydantic import BaseModel


class OneRepMaxRequest(BaseModel):
    weight_kg: float
    reps: int


class OneRepMaxResponse(BaseModel):
    epley: float
    brzycki: float
    average: float


class OneRepMaxHistoryPoint(BaseModel):
    date: date
    estimated_one_rep_max: float
    rpe: float | None
    bodyweight_kg: float | None


class PlateauResponse(BaseModel):
    is_plateaued: bool
    slope_per_week: float
    percent_change_per_week: float
    sessions_used: int
    history: list[OneRepMaxHistoryPoint]


class StrengthStandardRequest(BaseModel):
    exercise_id: int
    weight_kg: float
    reps: int


class StrengthStandardResponse(BaseModel):
    tier: str
    bodyweight_ratio: float
    bodyweight_kg: float
    estimated_one_rep_max: float


class CurrentStrengthStandardResponse(StrengthStandardResponse):
    as_of_date: date
