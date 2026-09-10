import pytest
import uuid
from app.database import init_db, SessionLocal
from app.models.user import User
from app.schemas.user import UserProfileUpdate, UserProfileResponse

def test_user_extended_profile_fields():
    init_db()
    db = SessionLocal()
    unique_email = f"student_{uuid.uuid4().hex[:8]}@university.edu"
    try:
        user = User(
            email=unique_email,
            name="Alex Chen",
            role="student",
            organization="Stanford University",
            department="Computer Science Major",
            avatar="data:image/png;base64,samplebase64data",
            bio="Passionate engineer building AI & full-stack apps.",
            grad_year="2021 - 2025",
            specialization="Cloud Infrastructure Specialization",
            github_url="https://github.com/alexchen",
            linkedin_url="https://linkedin.com/in/alexchen",
            portfolio_url="https://alexchen.dev"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        assert user.id is not None
        assert user.avatar.startswith("data:image")
        assert user.grad_year == "2021 - 2025"
        assert user.github_url == "https://github.com/alexchen"

        profile_res = UserProfileResponse.model_validate(user)
        assert profile_res.name == "Alex Chen"
        assert profile_res.portfolio_url == "https://alexchen.dev"
    finally:
        db.close()
