from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    name: Optional[str] = None
    role: Optional[str] = "student"
    organization: Optional[str] = None
    department: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
