from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from app.database import Base

class SkillProfile(Base):
    __tablename__ = "skill_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    target_role = Column(String, default="Cloud Infrastructure Engineer")
    competencies = Column(JSON, default=dict)
