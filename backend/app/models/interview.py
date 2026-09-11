from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base

class InterviewSlot(Base):
    __tablename__ = "interview_slots"

    id = Column(Integer, primary_key=True, index=True)
    day = Column(String, nullable=False)           # e.g., 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'
    date = Column(String, nullable=False)          # e.g., 'Sep 14'
    time = Column(String, nullable=False)          # e.g., '10:00 AM'
    status = Column(String, default="available")   # 'available', 'confirmed', 'completed', 'cancelled'
    candidate_name = Column(String, nullable=True) # e.g., 'Alex Chen'
    candidate_school = Column(String, nullable=True) # e.g., 'Stanford University'
    interviewer = Column(String, default="Engineering Panel")
    round_type = Column(String, default="Technical Coding") # 'Technical Coding', 'System Architecture', 'Behavioral & Culture', 'Executive Review'
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
