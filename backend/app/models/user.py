from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    role = Column(String, default="student")  # 'student' | 'recruiter'
    organization = Column(String, nullable=True)
    department = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
