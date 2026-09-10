from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    name: Optional[str] = None
    role: Optional[str] = "student"
    organization: Optional[str] = None
    department: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    grad_year: Optional[str] = None
    specialization: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    organization: Optional[str] = None
    department: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    grad_year: Optional[str] = None
    specialization: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None

class UserProfileResponse(UserBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class UserResponse(UserBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

