from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.user import Sex


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    sex: Sex


class UserRead(BaseModel):
    id: int
    email: EmailStr
    sex: Sex
    created_at: datetime

    class Config:
        from_attributes = True
