from pydantic import BaseModel, Field
from typing import List, Optional

class ChatMessage(BaseModel):
    role: str  # 'user' | 'assistant' | 'system'
    content: str

class StudentProfile(BaseModel):
    name: Optional[str] = "Alex Chen"
    major: Optional[str] = "B.S. in Computer Science"
    skills: Optional[List[str]] = Field(default_factory=lambda: ["React", "Node.js", "Python"])
    target_role: Optional[str] = "Cloud Infrastructure Engineer"

class MentorChatRequest(BaseModel):
    messages: List[ChatMessage]
    student_profile: Optional[StudentProfile] = None

class MentorChatResponse(BaseModel):
    reply: str
    model: str
    success: bool
