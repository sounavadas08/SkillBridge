# Profile Picture & Profile Data Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide full student profile data editing and instant profile picture uploading via direct avatar click/hover and a dedicated `EditProfileModal`, backed by FastAPI and SQLite persistence with local storage synchronization.

**Architecture:** Extend SQLite `users` table with `avatar`, `bio`, `grad_year`, `specialization`, `github_url`, `linkedin_url`, and `portfolio_url`. Create `GET /api/auth/profile` and `PUT /api/auth/profile` in FastAPI. In the React frontend, add direct avatar file upload with FileReader preview, `EditProfileModal.jsx` for all fields, and sync state through `App.jsx` and `localStorage`.

**Tech Stack:** React 18, Tailwind CSS / Vanilla CSS, Lucide React icons, FastAPI, SQLAlchemy, SQLite, Pydantic v2.

## Global Constraints

- Backend must persist profile updates in `backend/skillbridge.db`.
- Profile image files must be handled as base64 Data URLs so no third-party cloud bucket setup is required.
- Profile changes must immediately reflect across the entire UI (Navbar, Command Center, SkillVault) without requiring a page reload.
- Changes must persist in browser `localStorage` as well as the backend SQLite database.

---

### Task 1: Backend Model & Schemas Extension

**Files:**
- Modify: `backend/app/models/user.py`
- Modify: `backend/app/schemas/user.py`
- Test: `backend/tests/test_profile_model.py`

**Interfaces:**
- Produces: `User` model with `avatar`, `bio`, `grad_year`, `specialization`, `github_url`, `linkedin_url`, `portfolio_url` attributes, and `UserProfileUpdate`, `UserProfileResponse` Pydantic schemas.

- [ ] **Step 1: Write test for updated user model and schemas**

In `backend/tests/test_profile_model.py`:
```python
import pytest
import uuid
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.schemas.user import UserProfileUpdate, UserProfileResponse

def test_user_extended_profile_fields():
    Base.metadata.create_all(bind=engine)
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
```

- [ ] **Step 2: Update `backend/app/models/user.py`**

```python
from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime, timezone
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    role = Column(String, default="student")  # 'student' | 'recruiter'
    organization = Column(String, nullable=True)  # University or Company
    department = Column(String, nullable=True)    # Major or Department
    avatar = Column(Text, nullable=True)          # Base64 data URL or photo URL
    bio = Column(Text, nullable=True)             # Professional bio
    grad_year = Column(String, nullable=True)     # e.g. "2021 - 2025"
    specialization = Column(String, nullable=True) # e.g. "Software Engineering Specialization"
    github_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
```

- [ ] **Step 3: Update `backend/app/schemas/user.py`**

```python
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
```

- [ ] **Step 4: Run test and verify it passes**

Run: `.\backend\venv\Scripts\python.exe -m pytest backend/tests/test_profile_model.py -v`  
Expected: PASS  

- [ ] **Step 5: Commit**

```bash
git add backend/app/models/user.py backend/app/schemas/user.py backend/tests/test_profile_model.py
git commit -m "feat(backend): add extended profile fields to user model and schemas"
```

---

### Task 2: Profile API Endpoints in FastAPI

**Files:**
- Modify: `backend/app/routers/auth.py`
- Test: `backend/tests/test_profile_api.py`

**Interfaces:**
- Produces: `GET /api/auth/profile` and `PUT /api/auth/profile` in `auth.router`.

- [ ] **Step 1: Write test for profile API endpoints**

In `backend/tests/test_profile_api.py`:
```python
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_get_and_update_profile():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Get profile
        get_res = await ac.get("/api/auth/profile")
        assert get_res.status_code == 200
        data = get_res.json()
        assert "name" in data

        # 2. Update profile
        update_payload = {
            "name": "Alexander Chen",
            "bio": "Updated bio text for test.",
            "avatar": "data:image/png;base64,newavatar123",
            "github_url": "https://github.com/alexanderchen"
        }
        put_res = await ac.put("/api/auth/profile", json=update_payload)
        assert put_res.status_code == 200
        updated = put_res.json()
        assert updated["name"] == "Alexander Chen"
        assert updated["bio"] == "Updated bio text for test."
        assert updated["avatar"] == "data:image/png;base64,newavatar123"
        assert updated["github_url"] == "https://github.com/alexanderchen"
```

- [ ] **Step 2: Implement `GET` and `PUT` `/api/auth/profile` in `backend/app/routers/auth.py`**

In `backend/app/routers/auth.py`:
```python
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
```

- [ ] **Step 3: Run test and verify it passes**

Run: `.\backend\venv\Scripts\python.exe -m pytest backend/tests/test_profile_api.py -v`  
Expected: PASS  

- [ ] **Step 4: Commit**

```bash
git add backend/app/routers/auth.py backend/tests/test_profile_api.py
git commit -m "feat(api): add GET and PUT profile endpoints in auth router"
```

---

### Task 3: Edit Profile Modal Component

**Files:**
- Create: `src/components/student/EditProfileModal.jsx`

**Interfaces:**
- Produces: `<EditProfileModal isOpen={boolean} onClose={fn} user={userObj} onSave={fn} />`.

- [ ] **Step 1: Implement `EditProfileModal.jsx`**

Features:
- Backdrop click to close, ESC key listener.
- Avatar uploader with live preview, file input trigger, drag-and-drop zone.
- Form inputs for:
  - `name`
  - `department` (Major / Headline)
  - `organization` (University)
  - `grad_year` (Timeline)
  - `specialization` (Target role / specialization)
  - `bio` (Multi-line textarea)
  - `github_url`, `linkedin_url`, `portfolio_url`
- Loading state on save, instant validation, error alerts.

- [ ] **Step 2: Commit**

```bash
git add src/components/student/EditProfileModal.jsx
git commit -m "feat(ui): create EditProfileModal component with image drag-and-drop"
```

---

### Task 4: SkillVault View Integration

**Files:**
- Modify: `src/components/student/views/SkillVaultView.jsx`

**Interfaces:**
- Consumes: `user`, `onUpdateUser` props.
- Produces: Direct hover/click file upload on the avatar image, "Edit Profile" button, clickable social link pills (GitHub, LinkedIn, Portfolio), and dynamic bio/education display.

- [ ] **Step 1: Update `SkillVaultView.jsx`**
  - Add camera overlay on avatar hover (`group relative cursor-pointer`).
  - Add invisible `<input type="file" ref={fileInputRef} accept="image/*" />`.
  - Add `handleAvatarUpload(file)` reading with `FileReader` to base64 and calling `onUpdateUser`.
  - Add "Edit Profile" button opening `isEditModalOpen`.
  - Display clickable social/portfolio link badges with icons (`Github`, `Linkedin`, `Globe`).
  - Render `EditProfileModal` and handle save.

- [ ] **Step 2: Commit**

```bash
git add src/components/student/views/SkillVaultView.jsx
git commit -m "feat(ui): add direct avatar upload, edit profile button, and social links to SkillVault"
```

---

### Task 5: Global React State & LocalStorage Persistence Sync

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/student/StudentPortalLayout.jsx`

**Interfaces:**
- Ensures `onUpdateUser(updatedUser)` propagates changes to `currentUser` in `App.jsx`, stores to `localStorage`, and optionally sends `PUT /api/auth/profile`.

- [ ] **Step 1: Update `App.jsx` and `StudentPortalLayout.jsx`**
  - Implement `handleUpdateProfile(updatedData)` in `App.jsx` that updates `currentUser` state, saves to `localStorage.setItem('skillbridge_user', JSON.stringify(...))`, and sends asynchronous `PUT /api/auth/profile`.
  - Forward `onUpdateUser` into `StudentPortalLayout` -> `SkillVaultView` and `CommandCenterView`.
  - In `StudentPortalLayout.jsx`, ensure the sidebar and user avatar immediately reflect `user?.avatar`.

- [ ] **Step 2: Verify compilation with `npm run build`**

Run: `npm run build`  
Expected: PASS  

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx src/components/student/StudentPortalLayout.jsx
git commit -m "feat(state): synchronize profile updates with global React state and backend API"
```

---

### Task 6: End-to-End System Verification & Testing

- [ ] **Step 1: Run all backend tests**
  Run: `.\backend\venv\Scripts\python.exe -m pytest backend/tests/ -v`  
  Expected: ALL PASS  

- [ ] **Step 2: Verify live endpoint via curl**
  Test: `curl.exe -X GET http://localhost:5173/api/auth/profile`  
  Expected: 200 OK with Alex Chen's profile details.  

- [ ] **Step 3: Test profile update via curl**
  Test: `curl.exe -X PUT http://localhost:5173/api/auth/profile -H "Content-Type: application/json" -d "{\"name\":\"Alex Chen\"}"`  
  Expected: 200 OK  

- [ ] **Step 4: Final verification and summary**
