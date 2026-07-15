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
