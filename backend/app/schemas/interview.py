from pydantic import BaseModel, ConfigDict
from typing import Optional

class InterviewSlotBase(BaseModel):
    day: str
    date: str
    time: str
    status: str = "available"
    candidate_name: Optional[str] = None
    candidate_school: Optional[str] = None
    interviewer: str = "Engineering Panel"
    round_type: str = "Technical Coding"
    notes: Optional[str] = None

class InterviewSlotCreate(InterviewSlotBase):
    pass

class InterviewSlotUpdate(BaseModel):
    day: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    status: Optional[str] = None
    candidate_name: Optional[str] = None
    candidate_school: Optional[str] = None
    interviewer: Optional[str] = None
    round_type: Optional[str] = None
    notes: Optional[str] = None

class InterviewSlotResponse(InterviewSlotBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
