from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class SubmissionBase(BaseModel):
    candidate_name: str
    candidate_email: Optional[str] = None
    candidate_school: Optional[str] = None
    repo_url: str
    demo_url: Optional[str] = None
    notes: Optional[str] = None

class SubmissionCreate(SubmissionBase):
    pass

class SubmissionResponse(SubmissionBase):
    id: int
    challenge_id: int
    status: str
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChallengeBase(BaseModel):
    title: str
    company: str
    category: str = "frontend"
    tick_class: str = "rp-tick-frontend"
    stipend: str
    duration: str
    status: str = "Active Submissions"
    description: str
    tags: Optional[str] = None
    starter_repo: Optional[str] = None

class ChallengeCreate(ChallengeBase):
    pass

class ChallengeUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    category: Optional[str] = None
    tick_class: Optional[str] = None
    stipend: Optional[str] = None
    duration: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None
    starter_repo: Optional[str] = None
    applicants_count: Optional[int] = None
    verified_count: Optional[int] = None

class ChallengeResponse(ChallengeBase):
    id: int
    applicants_count: int
    verified_count: int
    created_at: datetime
    submissions: Optional[List[SubmissionResponse]] = []

    model_config = ConfigDict(from_attributes=True)
