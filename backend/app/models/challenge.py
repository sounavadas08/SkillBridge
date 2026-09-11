from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    category = Column(String, default="frontend")  # frontend, backend, data, ai, fullstack, mobile, cloud
    tick_class = Column(String, default="rp-tick-frontend")
    stipend = Column(String, nullable=False)       # e.g., "$750 USD"
    duration = Column(String, nullable=False)      # e.g., "3 Days"
    status = Column(String, default="Active Submissions")  # Active Submissions, Under Review, Completed
    description = Column(Text, nullable=False)
    tags = Column(String, nullable=True)           # e.g., "React, TypeScript, Virtualization"
    starter_repo = Column(String, nullable=True)
    applicants_count = Column(Integer, default=0)
    verified_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    submissions = relationship("ChallengeSubmission", back_populates="challenge", cascade="all, delete-orphan")


class ChallengeSubmission(Base):
    __tablename__ = "challenge_submissions"

    id = Column(Integer, primary_key=True, index=True)
    challenge_id = Column(Integer, ForeignKey("challenges.id"), nullable=False)
    candidate_name = Column(String, nullable=False)
    candidate_email = Column(String, nullable=True)
    candidate_school = Column(String, nullable=True)
    repo_url = Column(String, nullable=False)
    demo_url = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String, default="submitted")  # submitted, verified, under_review
    submitted_at = Column(DateTime, default=datetime.utcnow)

    challenge = relationship("Challenge", back_populates="submissions")
