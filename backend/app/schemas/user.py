from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.models.user import Sex


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    sex: Sex


class UserRead(BaseModel):
    id: int
    email: EmailStr
    sex: Sex
    created_at: datetime

    class Config:
        from_attributes = True
