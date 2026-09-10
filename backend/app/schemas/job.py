from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class JobBase(BaseModel):
    title: str
    company: str
    location: str
    work_type: str = "Remote"
    duration: str = "6 Months"
    skills_required: List[str] = []
    match_score_base: int = 85

class JobResponse(JobBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class ApplicationBase(BaseModel):
    job_id: Optional[int] = None
    role_title: str
    company: str
    match_confidence: int = 90
    status: str = "Under Review"
    date_submitted: str

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationResponse(ApplicationBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
