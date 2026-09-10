from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from app.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, nullable=False)
    work_type = Column(String, default="Remote")
    duration = Column(String, default="6 Months")
    skills_required = Column(JSON, default=list)
    match_score_base = Column(Integer, default=85)

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    role_title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    match_confidence = Column(Integer, default=90)
    status = Column(String, default="Under Review")
    date_submitted = Column(String, nullable=False)
