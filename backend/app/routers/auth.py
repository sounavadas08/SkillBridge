from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserProfileUpdate, UserProfileResponse

router = APIRouter(prefix="/api/auth", tags=["Auth & Profile"])

DEFAULT_STUDENT_PROFILE = {
    "email": "alex.chen@university.edu",
    "name": "Alex Chen",
    "role": "student",
    "organization": "Tech University",
    "department": "Computer Science Major",
    "avatar": "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop&auto=format",
    "bio": "Passionate frontend developer with a strong foundation in modern JavaScript frameworks. I specialize in building accessible, high-performance user interfaces and enjoy solving complex UX challenges. Currently focused on mastering TypeScript and learning about scalable system design.",
    "grad_year": "2021 - 2025",
    "specialization": "Software Engineering Specialization",
    "github_url": "https://github.com",
    "linkedin_url": "https://linkedin.com",
    "portfolio_url": "https://alexchen.dev"
}

@router.post("/login")
async def login(user_data: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        user = User(
            email=user_data.email,
            name=user_data.name or user_data.email.split("@")[0],
            role=user_data.role or "student",
            organization=user_data.organization or "Tech University",
            department=user_data.department or "Computer Science Major",
            avatar=DEFAULT_STUDENT_PROFILE["avatar"],
            bio=DEFAULT_STUDENT_PROFILE["bio"],
            grad_year=DEFAULT_STUDENT_PROFILE["grad_year"],
            specialization=DEFAULT_STUDENT_PROFILE["specialization"],
            github_url=DEFAULT_STUDENT_PROFILE["github_url"],
            linkedin_url=DEFAULT_STUDENT_PROFILE["linkedin_url"],
            portfolio_url=DEFAULT_STUDENT_PROFILE["portfolio_url"]
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "token": "sb_session_token_sample",
        "user": UserProfileResponse.model_validate(user)
    }

@router.get("/profile", response_model=UserProfileResponse)
async def get_profile(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.role == "student").first()
    if not user:
        user = User(**DEFAULT_STUDENT_PROFILE)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.put("/profile", response_model=UserProfileResponse)
async def update_profile(profile_data: UserProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.role == "student").first()
    if not user:
        user = User(**DEFAULT_STUDENT_PROFILE)
        db.add(user)
        db.commit()
        db.refresh(user)

    update_dict = profile_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        if value is not None:
            setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user
