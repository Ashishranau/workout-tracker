from pydantic import BaseModel


class OneRepMaxRequest(BaseModel):
    weight_kg: float
    reps: int


class OneRepMaxResponse(BaseModel):
    epley: float
    brzycki: float
    average: float
