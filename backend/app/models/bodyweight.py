from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, UniqueConstraint
from sqlalchemy.sql import func

from app.database import Base


class BodyweightLog(Base):
    __tablename__ = "bodyweight_logs"
    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_bodyweight_logs_user_date"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    weight_kg = Column(Numeric(5, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
