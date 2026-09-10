from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    role = Column(String, default="student")  # 'student' | 'recruiter'
    organization = Column(String, nullable=True)  # University or Company
    department = Column(String, nullable=True)    # Major or Department
    avatar = Column(String, nullable=True)        # Base64 data URL or photo URL
    bio = Column(String, nullable=True)           # Professional summary
    grad_year = Column(String, nullable=True)     # e.g. "2021 - 2025"
    specialization = Column(String, nullable=True)# e.g. "Software Engineering Specialization"
    github_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
