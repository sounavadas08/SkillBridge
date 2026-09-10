from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

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

# Mock Interview Pydantic Schemas
class InterviewStartRequest(BaseModel):
    role: str = "Frontend Developer Intern"
    interview_type: str = "Comprehensive (Tech + Behavioral)"
    difficulty: str = "Mid-Level"
    count: int = 3

class InterviewStartResponse(BaseModel):
    success: bool
    questions: List[Dict[str, Any]]
    model: str

class InterviewEvaluateRequest(BaseModel):
    role: str
    question: str
    student_answer: str

class InterviewEvaluateResponse(BaseModel):
    success: bool
    evaluation: Dict[str, Any]
    model: str
