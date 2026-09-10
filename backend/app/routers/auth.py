from fastapi import APIRouter
from app.schemas.user import UserCreate

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/login")
async def login(user_data: UserCreate):
    return {
        "token": "sb_session_token_sample",
        "user": {
            "id": 1,
            "email": user_data.email,
            "name": user_data.name or user_data.email.split("@")[0],
            "role": user_data.role or "student",
            "organization": user_data.organization or "Stanford University",
            "department": user_data.department or "Computer Science"
        }
    }
