# Database Integration & Role Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate a persistent SQLite/SQLAlchemy database into SkillBridge with bcrypt password hashing, JWT authentication, role-based access control, and complete role-tailored dashboards for Students, Recruiters, and Admins.

**Architecture:** Extend the existing FastAPI backend (`backend/app`) with declarative SQLAlchemy models (`users`, `student_profiles`, `recruiter_profiles`, `jobs`, `applications`), bcrypt password hashing, and JWT bearer token dependencies. On the frontend, replace mock states with an authenticated `apiFetch` client, provide a unified Sign In / Register toggle on `login.html`, synchronize `onboarding.html` into the DB, and render role-gated portal views in `portal.html`.

**Tech Stack:** Python 3.11+, FastAPI, SQLAlchemy, SQLite, passlib[bcrypt], python-jose, React 18, Vite, Vanilla CSS.

## Global Constraints
- Windows OS with PowerShell: use `;` to chain commands, never `&&`.
- Maintain design system: crimson red + amber accents (#FF8100), dark mode crimson rose (#B85A12), liquid glass styling with refractive edges, Plus Jakarta Sans typography.
- No TailwindCSS; use vanilla CSS and design tokens.
- No emojis in UI text.
- Preserve existing `liquidGlass3D.js` logic and GPU optimization attributes.

---

### Task 1: Backend Dependencies & Security Foundation

**Files:**
- Modify: `backend/requirements.txt`
- Create: `backend/app/utils/security.py`
- Modify: `backend/app/config.py`
- Test: `backend/tests/test_security.py`

**Interfaces:**
- Produces:
  - `get_password_hash(password: str) -> str`
  - `verify_password(plain_password: str, hashed_password: str) -> bool`
  - `create_access_token(data: dict, expires_delta: timedelta | None = None) -> str`
  - `decode_access_token(token: str) -> dict`

- [ ] **Step 1: Write test for password hashing and JWT utility**

```python
# backend/tests/test_security.py
from app.utils.security import get_password_hash, verify_password, create_access_token, decode_access_token

def test_password_hashing():
    raw = "SecretPass123"
    hashed = get_password_hash(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPass", hashed) is False

def test_jwt_token_generation_and_decoding():
    payload = {"sub": "user@example.com", "role": "student", "user_id": 10}
    token = create_access_token(payload)
    decoded = decode_access_token(token)
    assert decoded["sub"] == "user@example.com"
    assert decoded["role"] == "student"
    assert decoded["user_id"] == 10
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\backend\venv\Scripts\python.exe -m pytest backend/tests/test_security.py`  
Expected: FAIL (ImportError or module not found)

- [ ] **Step 3: Update `requirements.txt` and install security packages**

Add to `backend/requirements.txt`:
```txt
passlib[bcrypt]>=1.7.4
python-jose[cryptography]>=3.3.0
```
Run command: `.\backend\venv\Scripts\python.exe -m pip install "passlib[bcrypt]" "python-jose[cryptography]"`

- [ ] **Step 4: Update `backend/app/config.py` with JWT settings**

```python
# backend/app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    cloudflare_api_token: str = ""
    cloudflare_account_id: str = ""
    cloudflare_model: str = "@cf/meta/llama-3.1-8b-instruct-fp8"
    database_url: str = "sqlite:///./skillbridge.db"
    cors_origins: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    jwt_secret: str = "skillbridge-super-secret-jwt-key-2026"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

def get_settings() -> Settings:
    return settings
```

- [ ] **Step 5: Implement `backend/app/utils/security.py`**

```python
# backend/app/utils/security.py
from datetime import datetime, timedelta, timezone
from typing import Optional, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.config import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)

def decode_access_token(token: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}")
```

- [ ] **Step 6: Run tests and verify they pass**

Run: `.\backend\venv\Scripts\python.exe -m pytest backend/tests/test_security.py`  
Expected: PASS

- [ ] **Step 7: Commit changes**

Run: `git add backend/requirements.txt backend/app/config.py backend/app/utils/security.py backend/tests/test_security.py; git commit -m "feat(auth): add password hashing and JWT token utility"`

---

### Task 2: Database Models & Seed Data Migration

**Files:**
- Modify: `backend/app/models/user.py`
- Modify: `backend/app/models/job.py`
- Modify: `backend/app/database.py`
- Test: `backend/tests/test_models.py`

**Interfaces:**
- Produces models:
  - `User(id, email, hashed_password, name, role, avatar, is_active, created_at, last_login)`
  - `StudentProfile(id, user_id, university, department, grad_year, specialization, bio, career_stage, interests, experience_level, student_goal, github_url, linkedin_url, portfolio_url)`
  - `RecruiterProfile(id, user_id, company_name, industry, company_size, website, hiring_needs, hiring_skills, hiring_goal)`
  - `init_db()` with automatic seed of default Admin, Student demo, and Recruiter demo accounts.

- [ ] **Step 1: Write test for models and seed initialization**

```python
# backend/tests/test_models.py
from app.database import SessionLocal, init_db
from app.models.user import User, StudentProfile, RecruiterProfile
from app.utils.security import verify_password

def test_database_init_and_seed():
    init_db()
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@skillbridge.edu").first()
        assert admin is not None
        assert admin.role == "admin"
        assert verify_password("adminpassword123", admin.hashed_password) is True

        student = db.query(User).filter(User.email == "alex.chen@university.edu").first()
        assert student is not None
        assert student.role == "student"
        assert student.student_profile is not None

        recruiter = db.query(User).filter(User.email == "recruiter@techventures.io").first()
        assert recruiter is not None
        assert recruiter.role == "recruiter"
        assert recruiter.recruiter_profile is not None
    finally:
        db.close()
```

- [ ] **Step 2: Update `backend/app/models/user.py`**

```python
# backend/app/models/user.py
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="student")  # 'student' | 'recruiter' | 'admin'
    avatar = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_login = Column(DateTime, nullable=True)

    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    recruiter_profile = relationship("RecruiterProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    jobs_posted = relationship("Job", back_populates="recruiter", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    university = Column(String, default="Tech University")
    department = Column(String, default="Computer Science Major")
    grad_year = Column(String, default="2025")
    specialization = Column(String, default="Software Engineering & AI Systems")
    bio = Column(Text, nullable=True)
    career_stage = Column(String, nullable=True)
    interests = Column(JSON, default=list)
    experience_level = Column(String, nullable=True)
    student_goal = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)

    user = relationship("User", back_populates="student_profile")

class RecruiterProfile(Base):
    __tablename__ = "recruiter_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    company_name = Column(String, default="TechVentures Labs")
    industry = Column(String, default="Cloud & AI Infrastructure")
    company_size = Column(String, default="50-250 Employees")
    website = Column(String, nullable=True)
    hiring_needs = Column(JSON, default=list)
    hiring_skills = Column(JSON, default=list)
    hiring_goal = Column(String, nullable=True)

    user = relationship("User", back_populates="recruiter_profile")
```

- [ ] **Step 3: Update `backend/app/models/job.py` with foreign keys**

```python
# backend/app/models/job.py
from sqlalchemy import Column, Integer, String, JSON, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, nullable=False)
    work_type = Column(String, default="Remote")
    duration = Column(String, default="6 Months")
    skills_required = Column(JSON, default=list)
    match_score_base = Column(Integer, default=85)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    recruiter = relationship("User", back_populates="jobs_posted")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role_title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    match_confidence = Column(Integer, default=90)
    status = Column(String, default="Under Review")
    date_submitted = Column(String, nullable=False)

    student = relationship("User", back_populates="applications")
    job = relationship("Job")
```

- [ ] **Step 4: Update `backend/app/database.py` with schema sync and seed execution**

Implement migration helper in `init_db()` to automatically create missing tables, add missing columns, and seed Admin, Student Demo, and Recruiter Demo accounts.

- [ ] **Step 5: Run tests and verify they pass**

Run: `.\backend\venv\Scripts\python.exe -m pytest backend/tests/test_models.py`  
Expected: PASS

- [ ] **Step 6: Commit changes**

Run: `git add backend/app/models/user.py backend/app/models/job.py backend/app/database.py backend/tests/test_models.py; git commit -m "feat(db): add normalized student/recruiter profile models and seed provisioning"`

---

### Task 3: Authentication Schemas & API Endpoints

**Files:**
- Modify: `backend/app/schemas/user.py`
- Modify: `backend/app/routers/auth.py`
- Test: `backend/tests/test_auth_api.py`

**Interfaces:**
- Endpoints:
  - `POST /api/auth/register` -> `{ token, user }`
  - `POST /api/auth/login` -> `{ token, user }`
  - `GET /api/auth/me` -> `UserDetailResponse`
  - `PUT /api/auth/profile` -> `UserDetailResponse`

- [ ] **Step 1: Write test for Auth API endpoints**

```python
# backend/tests/test_auth_api.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_and_login_flow():
    # Register new student
    reg_resp = client.post("/api/auth/register", json={
        "email": "teststudent@skillbridge.edu",
        "password": "Password123!",
        "name": "Test Student",
        "role": "student"
    })
    assert reg_resp.status_code == 200
    reg_data = reg_resp.json()
    assert "token" in reg_data
    assert reg_data["user"]["email"] == "teststudent@skillbridge.edu"
    assert reg_data["user"]["role"] == "student"

    # Login
    login_resp = client.post("/api/auth/login", json={
        "email": "teststudent@skillbridge.edu",
        "password": "Password123!"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["token"]

    # Profile me
    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["name"] == "Test Student"
```

- [ ] **Step 2: Update `backend/app/schemas/user.py`**

Define `UserRegister`, `UserLogin`, `StudentProfileUpdate`, `RecruiterProfileUpdate`, `UserProfileUpdate`, and `UserDetailResponse`.

- [ ] **Step 3: Update `backend/app/routers/auth.py` with real bcrypt, JWT, and DB persistence**

Implement:
- `get_current_user` dependency with Bearer token decoding and DB lookup.
- `POST /api/auth/register` (checks for existing email, hashes password, saves `User`, creates empty profile, returns JWT token).
- `POST /api/auth/login` (verifies password, sets `last_login`, returns JWT token).
- `GET /api/auth/me` (returns current user and populated profile).
- `PUT /api/auth/profile` (updates student or recruiter profile depending on role).

- [ ] **Step 4: Run tests and verify they pass**

Run: `.\backend\venv\Scripts\python.exe -m pytest backend/tests/test_auth_api.py`  
Expected: PASS

- [ ] **Step 5: Commit changes**

Run: `git add backend/app/schemas/user.py backend/app/routers/auth.py backend/tests/test_auth_api.py; git commit -m "feat(api): implement secure register, login, and profile auth endpoints"`

---

### Task 4: Recruiter & Admin Management Endpoints

**Files:**
- Create: `backend/app/routers/recruiter.py`
- Create: `backend/app/routers/admin.py`
- Modify: `backend/app/main.py`
- Test: `backend/tests/test_admin_recruiter_api.py`

**Interfaces:**
- Recruiter Endpoints:
  - `GET /api/recruiter/jobs`
  - `POST /api/recruiter/jobs`
  - `GET /api/recruiter/applicants`
- Admin Endpoints:
  - `GET /api/admin/stats`
  - `GET /api/admin/users`
  - `PATCH /api/admin/users/{id}/toggle-status`
  - `DELETE /api/admin/users/{id}`

- [ ] **Step 1: Write test for Admin and Recruiter API**

Test stats retrieval, user listing, role filtering, and job posting.

- [ ] **Step 2: Implement `backend/app/routers/recruiter.py`**

Create endpoints for fetching posted jobs, creating jobs, and reviewing candidate applications.

- [ ] **Step 3: Implement `backend/app/routers/admin.py`**

Create endpoints for platform statistics, user management, status toggling, and account deletion with `require_role(["admin"])` protection.

- [ ] **Step 4: Register new routers in `backend/app/main.py`**

Add:
```python
from app.routers import recruiter, admin
app.include_router(recruiter.router)
app.include_router(admin.router)
```

- [ ] **Step 5: Run tests and verify they pass**

Run: `.\backend\venv\Scripts\python.exe -m pytest backend/tests/test_admin_recruiter_api.py`  
Expected: PASS

- [ ] **Step 6: Commit changes**

Run: `git add backend/app/routers/recruiter.py backend/app/routers/admin.py backend/app/main.py backend/tests/test_admin_recruiter_api.py; git commit -m "feat(admin): add admin metrics, user management, and recruiter job endpoints"`

---

### Task 5: Frontend API Client & Session Helper

**Files:**
- Create: `src/utils/api.js`
- Modify: `src/utils/navigation.js`

**Interfaces:**
- Produces:
  - `getAuthToken()`, `setAuthToken(token)`, `clearAuthToken()`
  - `apiFetch(url, options)`: Wrapper that adds `Authorization: Bearer <token>`, parses JSON, and handles 401 redirect to `/login.html`.
  - `authAPI`: Methods `login`, `register`, `getMe`, `updateProfile`.

- [ ] **Step 1: Implement `src/utils/api.js`**

Implement secure centralized token injection, error extraction, and endpoint wrappers.

- [ ] **Step 2: Update `src/utils/navigation.js`**

Export `getAuthToken`, `setAuthToken`, `clearAuthToken` alongside existing user session functions.

- [ ] **Step 3: Commit changes**

Run: `git add src/utils/api.js src/utils/navigation.js; git commit -m "feat(client): implement authenticated API fetch client and token storage"`

---

### Task 6: Login & Registration UI with Role Switcher

**Files:**
- Modify: `src/components/login/LoginView.jsx`
- Modify: `src/components/login/Login.css`
- Modify: `src/pages/LoginPage.jsx`

**Interfaces:**
- Features:
  - Tab 1: **Sign In** (Email + Password, Quick Demo Chips: Student, Recruiter, Admin).
  - Tab 2: **Create Account** (Full Name, Email, Password, Segmented Role Toggle: Student vs Recruiter).
  - Submitting calls real `authAPI.login` or `authAPI.register`.
  - Automatic redirect to `/onboarding.html` on new account registration.

- [ ] **Step 1: Update `LoginView.jsx` with Sign In / Register toggle and role selection**
- [ ] **Step 2: Update `Login.css` with tab styling and role selector liquid glass styling**
- [ ] **Step 3: Update `LoginPage.jsx` to call backend `authAPI.login` and `authAPI.register`**
- [ ] **Step 4: Commit changes**

Run: `git add src/components/login/LoginView.jsx src/components/login/Login.css src/pages/LoginPage.jsx; git commit -m "feat(ui): add register tab, role selector, and live auth API integration"`

---

### Task 7: Onboarding Database Synchronization

**Files:**
- Modify: `src/pages/OnboardingPage.jsx`
- Modify: `src/components/login/OnboardingView.jsx`

**Interfaces:**
- Consumes: Authenticated user session.
- On step 5 completion: Invokes `authAPI.updateProfile(data)` sending collected preferences into `student_profiles` or `recruiter_profiles` in the database.
- Redirects to `/portal.html`.

- [ ] **Step 1: Update `OnboardingPage.jsx` to synchronize step answers to backend**
- [ ] **Step 2: Ensure user session is updated with latest profile data**
- [ ] **Step 3: Commit changes**

Run: `git add src/pages/OnboardingPage.jsx src/components/login/OnboardingView.jsx; git commit -m "feat(onboarding): sync candidate and employer onboarding responses to database"`

---

### Task 8: Role-Gated Portal Dashboards (Student, Recruiter, Admin)

**Files:**
- Create: `src/components/admin/AdminPortalView.jsx`
- Create: `src/components/admin/AdminPortal.css`
- Create: `src/components/recruiter/RecruiterPortalView.jsx`
- Create: `src/components/recruiter/RecruiterPortal.css`
- Modify: `src/components/login/DashboardView.jsx`
- Modify: `src/pages/PortalPage.jsx`

**Interfaces:**
- Renders:
  - If `user.role === 'admin'`: `AdminPortalView` (system metrics cards, search & filter user table, status toggle, delete modal).
  - If `user.role === 'recruiter'`: `RecruiterPortalView` (jobs posted, new job creation modal, applicant review list).
  - If `user.role === 'student'`: Existing `StudentPortalLayout` (Command Center, CV Architect, Curriculum, Radar, Jobs, Applications).

- [ ] **Step 1: Implement `src/components/admin/AdminPortalView.jsx` and CSS**
- [ ] **Step 2: Implement `src/components/recruiter/RecruiterPortalView.jsx` and CSS**
- [ ] **Step 3: Update `DashboardView.jsx` to delegate to Student, Recruiter, or Admin view**
- [ ] **Step 4: Update `PortalPage.jsx` to fetch live `/api/auth/me` on mount**
- [ ] **Step 5: Commit changes**

Run: `git add src/components/admin/ src/components/recruiter/ src/components/login/DashboardView.jsx src/pages/PortalPage.jsx; git commit -m "feat(portal): add dedicated Admin management and Recruiter hiring dashboards"`

---

### Task 9: End-to-End Testing & Verification

**Files:**
- Execute: Automated tests in `backend/tests/`
- Execute: Browser verification on `http://localhost:5173`

- [ ] **Step 1: Run all backend pytest suites**
Run: `.\backend\venv\Scripts\python.exe -m pytest backend/tests/ -v`
- [ ] **Step 2: Verify Admin login in browser**
Use quick demo chip for Admin, inspect platform KPIs and user table.
- [ ] **Step 3: Verify Recruiter login and Job creation in browser**
Use quick demo chip for Recruiter, post a job, check that it persists in DB.
- [ ] **Step 4: Verify Student registration and Onboarding completion**
Create a new student account, complete onboarding, check profile in portal.
- [ ] **Step 5: Final git push**
Run: `git push origin main`
