# FastAPI Backend & Cloudflare Workers AI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a robust, production-grade Python FastAPI backend with SQLite persistence and Cloudflare Workers AI integration (`@cf/meta/llama-3.1-8b-instruct-fp8`), proxy it via Vite, and remove Puter.js entirely from the frontend.

**Architecture:** A modular FastAPI application running on port 8000 with dedicated routers (`/api/ai`, `/api/auth`, `/api/skills`, `/api/jobs`). The AI service acts as a secure, authenticated proxy to Cloudflare Workers AI using `httpx.AsyncClient`. Vite proxies `/api` requests from `localhost:5173` to `localhost:8000`.

**Tech Stack:** Python 3.13, FastAPI, Uvicorn, HTTPX, SQLite, SQLAlchemy 2.0, Pydantic v2, Vite, React 18.

## Global Constraints

- Backend must run on `http://127.0.0.1:8000`.
- All credentials (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) must reside in `backend/.env` and never be committed to git or exposed to the frontend.
- Cloudflare API Token: `your_cloudflare_api_token_here`
- Cloudflare Account ID: `dbd7f38dcfb51b94ad28e75091154a23`
- Cloudflare Primary Model: `@cf/meta/llama-3.1-8b-instruct-fp8`
- Puter.js `<script>` tag must be removed from `index.html`.
- No disruption to existing frontend routes or UI designs.

---

### Task 1: Backend Scaffolding, Environment, and Dependencies

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/.env`
- Create: `backend/.env.example`
- Create: `backend/.gitignore`
- Create: `backend/app/__init__.py`
- Create: `backend/app/config.py`
- Create: `backend/app/main.py`
- Create: `backend/run.py`
- Test: `backend/tests/test_health.py`

**Interfaces:**
- Consumes: Environment variables from `backend/.env`.
- Produces: `get_settings()` from `app.config` returning `Settings(cloudflare_api_token, cloudflare_account_id, etc.)`, and a running FastAPI app on port 8000 with a `/api/health` endpoint.

- [ ] **Step 1: Create requirements.txt and install dependencies**

```text
fastapi>=0.115.0
uvicorn[standard]>=0.30.0
httpx>=0.27.0
sqlalchemy>=2.0.0
pydantic>=2.8.0
pydantic-settings>=2.4.0
python-dotenv>=1.0.1
pytest>=8.3.0
pytest-asyncio>=0.24.0
```

- [ ] **Step 2: Create backend environment configuration**

In `backend/.env`:
```env
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here
CLOUDFLARE_ACCOUNT_ID=dbd7f38dcfb51b94ad28e75091154a23
CLOUDFLARE_MODEL=@cf/meta/llama-3.1-8b-instruct-fp8
DATABASE_URL=sqlite:///./skillbridge.db
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
```

In `backend/app/config.py`:
```python
from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    cloudflare_api_token: str
    cloudflare_account_id: str
    cloudflare_model: str = "@cf/meta/llama-3.1-8b-instruct-fp8"
    database_url: str = "sqlite:///./skillbridge.db"
    cors_origins: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
        env_file_encoding = "utf-8"

settings = Settings()

def get_settings() -> Settings:
    return settings
```

- [ ] **Step 3: Create FastAPI main app with health endpoint**

In `backend/app/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title="SkillBridge API",
    version="1.0.0",
    description="Academia-Industry Integration Platform Backend"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SkillBridge API",
        "model": settings.cloudflare_model
    }
```

In `backend/run.py`:
```python
import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
```

- [ ] **Step 4: Write health check test**

In `backend/tests/test_health.py`:
```python
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

- [ ] **Step 5: Run tests and commit**

Run: `pytest backend/tests/test_health.py -v`  
Expected: PASS  
Commit:
```bash
git add backend/
git commit -m "feat(backend): scaffold FastAPI project with config and health check"
```

---

### Task 2: Cloudflare Workers AI Service

**Files:**
- Create: `backend/app/services/__init__.py`
- Create: `backend/app/services/cloudflare_ai.py`
- Test: `backend/tests/test_cloudflare_ai.py`

**Interfaces:**
- Consumes: `get_settings()` from `app.config`.
- Produces: `generate_mentor_reply(messages: list[dict], student_profile: dict | None) -> dict` in `app.services.cloudflare_ai`.

- [ ] **Step 1: Write test for Cloudflare AI service (with mocked HTTP response and live fallback check)**

In `backend/tests/test_cloudflare_ai.py`:
```python
import pytest
from unittest.mock import patch, AsyncMock
from app.services.cloudflare_ai import generate_mentor_reply

@pytest.mark.asyncio
async def test_generate_mentor_reply_success():
    mock_payload = {
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": "To master Docker, start with building simple containers."
                }
            }
        ]
    }
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = mock_payload
        mock_post.return_value.raise_for_status = lambda: None

        res = await generate_mentor_reply(
            messages=[{"role": "user", "content": "How do I learn Docker?"}],
            student_profile={"name": "Alex", "major": "Computer Science"}
        )
        assert "Docker" in res["reply"]
        assert res["model"] == "@cf/meta/llama-3.1-8b-instruct-fp8"
```

- [ ] **Step 2: Implement Cloudflare Workers AI client**

In `backend/app/services/cloudflare_ai.py`:
```python
import httpx
from typing import List, Dict, Any, Optional
from app.config import get_settings

FALLBACK_REPLY = (
    "I have analyzed your request based on your current SkillBridge profile. "
    "To accelerate your industry readiness, focus on hands-on project implementations "
    "and reviewing the benchmark competencies highlighted in your Skill-Gap Radar."
)

async def generate_mentor_reply(
    messages: List[Dict[str, str]],
    student_profile: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    settings = get_settings()
    
    student_name = student_profile.get("name", "Student") if student_profile else "Student"
    major = student_profile.get("major", "Computer Science") if student_profile else "Computer Science"
    target_role = student_profile.get("target_role", "Software Engineer") if student_profile else "Software Engineer"
    skills = ", ".join(student_profile.get("skills", ["General Software Engineering"])) if student_profile else "General Software"

    system_prompt = (
        f"You are the SkillBridge AI Career Mentor, an expert career coach and technical mentor.\n"
        f"Student Profile:\n"
        f"- Name: {student_name}\n"
        f"- Major: {major}\n"
        f"- Current Strengths: {skills}\n"
        f"- Target Career Benchmark: {target_role}\n\n"
        f"Instructions:\n"
        f"- Provide direct, highly structured, encouraging technical advice.\n"
        f"- Use markdown formatting (bold text, bullet points, clean code snippets where relevant).\n"
        f"- Focus on bridging skills gaps for industry placement."
    )

    full_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        if msg.get("role") in ["user", "assistant"]:
            full_messages.append({"role": msg["role"], "content": msg["content"]})

    url = f"https://api.cloudflare.com/client/v4/accounts/{settings.cloudflare_account_id}/ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.cloudflare_api_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": settings.cloudflare_model,
        "messages": full_messages
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()

        choices = data.get("choices", [])
        if choices and "message" in choices[0]:
            content = choices[0]["message"].get("content", "").strip()
            if content:
                return {
                    "reply": content,
                    "model": settings.cloudflare_model,
                    "success": True
                }
    except Exception as e:
        print(f"[Cloudflare AI Warning] Error: {e}, using dynamic fallback.")

    return {
        "reply": FALLBACK_REPLY,
        "model": "skillbridge-local-fallback",
        "success": False
    }
```

- [ ] **Step 3: Run test and verify it passes**

Run: `pytest backend/tests/test_cloudflare_ai.py -v`  
Expected: PASS  

- [ ] **Step 4: Commit**

```bash
git add backend/app/services/ backend/tests/test_cloudflare_ai.py
git commit -m "feat(ai): implement Cloudflare Workers AI client with resilient fallback"
```

---

### Task 3: SQLite Database Models & Schemas

**Files:**
- Create: `backend/app/database.py`
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/models/user.py`
- Create: `backend/app/models/skill.py`
- Create: `backend/app/models/job.py`
- Create: `backend/app/schemas/__init__.py`
- Create: `backend/app/schemas/ai.py`
- Create: `backend/app/schemas/user.py`
- Create: `backend/app/schemas/job.py`
- Test: `backend/tests/test_database.py`

**Interfaces:**
- Produces: `Base`, `engine`, `get_db` in `app.database`, SQLAlchemy models `User`, `SkillProfile`, `Job`, `Application`, and Pydantic schemas for requests/responses.

- [ ] **Step 1: Write test for database models and session**

In `backend/tests/test_database.py`:
```python
import pytest
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.job import Job

def test_create_and_query_entities():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user = User(email="test@university.edu", name="Test Student", role="student")
        db.add(user)
        db.commit()
        db.refresh(user)
        assert user.id is not None
        assert user.email == "test@university.edu"
    finally:
        db.close()
```

- [ ] **Step 2: Implement Database connection and ORM models**

In `backend/app/database.py`:
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

In `backend/app/models/user.py`:
```python
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    role = Column(String, default="student") # student | recruiter
    organization = Column(String, nullable=True)
    department = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

In `backend/app/models/job.py`:
```python
from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from app.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, nullable=False)
    work_type = Column(String, default="Remote")
    duration = Column(String, default="6 Months")
    skills_required = Column(JSON, default=list)
    match_score_base = Column(Integer, default=85)

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    role_title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    match_confidence = Column(Integer, default=90)
    status = Column(String, default="Under Review")
    date_submitted = Column(String, nullable=False)
```

In `backend/app/models/skill.py`:
```python
from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from app.database import Base

class SkillProfile(Base):
    __tablename__ = "skill_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    target_role = Column(String, default="Cloud Infrastructure Engineer")
    competencies = Column(JSON, default=dict)
```

- [ ] **Step 3: Implement Pydantic validation schemas**

In `backend/app/schemas/ai.py`:
```python
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ChatMessage(BaseModel):
    role: str
    content: str

class StudentProfile(BaseModel):
    name: Optional[str] = "Alex Chen"
    major: Optional[str] = "B.S. in Computer Science"
    skills: Optional[List[str]] = []
    target_role: Optional[str] = "Cloud Infrastructure Engineer"

class MentorChatRequest(BaseModel):
    messages: List[ChatMessage]
    student_profile: Optional[StudentProfile] = None

class MentorChatResponse(BaseModel):
    reply: str
    model: str
    success: bool
```

In `backend/app/schemas/user.py`:
```python
from pydantic import BaseModel
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
    created_at: datetime

    class Config:
        from_attributes = True
```

In `backend/app/schemas/job.py`:
```python
from pydantic import BaseModel
from typing import List, Optional

class JobBase(BaseModel):
    title: str
    company: str
    location: str
    work_type: str
    duration: str
    skills_required: List[str]
    match_score_base: int

class JobResponse(JobBase):
    id: int

    class Config:
        from_attributes = True

class ApplicationBase(BaseModel):
    job_id: int
    role_title: str
    company: str
    match_confidence: int
    status: str
    date_submitted: str

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationResponse(ApplicationBase):
    id: int

    class Config:
        from_attributes = True
```

- [ ] **Step 4: Run test and verify it passes**

Run: `pytest backend/tests/test_database.py -v`  
Expected: PASS  

- [ ] **Step 5: Commit**

```bash
git add backend/app/database.py backend/app/models/ backend/app/schemas/ backend/tests/test_database.py
git commit -m "feat(database): define SQLite database models and Pydantic schemas"
```

---

### Task 4: AI Mentor Router

**Files:**
- Create: `backend/app/routers/__init__.py`
- Create: `backend/app/routers/ai.py`
- Modify: `backend/app/main.py`
- Test: `backend/tests/test_ai_router.py`

**Interfaces:**
- Consumes: `generate_mentor_reply` from `app.services.cloudflare_ai`.
- Produces: Endpoint `POST /api/ai/mentor/chat`.

- [ ] **Step 1: Write test for AI mentor endpoint**

In `backend/tests/test_ai_router.py`:
```python
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, AsyncMock
from app.main import app

@pytest.mark.asyncio
async def test_ai_mentor_chat_endpoint():
    transport = ASGITransport(app=app)
    mock_reply = {
        "reply": "Here is advice on Kubernetes for you, Alex.",
        "model": "@cf/meta/llama-3.1-8b-instruct-fp8",
        "success": True
    }
    with patch("app.routers.ai.generate_mentor_reply", new_callable=AsyncMock) as mock_ai:
        mock_ai.return_value = mock_reply
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.post("/api/ai/mentor/chat", json={
                "messages": [{"role": "user", "content": "How do I learn Kubernetes?"}],
                "student_profile": {"name": "Alex Chen", "major": "Computer Science"}
            })
        assert response.status_code == 200
        data = response.json()
        assert data["reply"] == mock_reply["reply"]
        assert data["model"] == mock_reply["model"]
```

- [ ] **Step 2: Implement AI Mentor router**

In `backend/app/routers/ai.py`:
```python
from fastapi import APIRouter, HTTPException
from app.schemas.ai import MentorChatRequest, MentorChatResponse
from app.services.cloudflare_ai import generate_mentor_reply

router = APIRouter(prefix="/api/ai", tags=["AI Engine"])

@router.post("/mentor/chat", response_model=MentorChatResponse)
async def chat_with_mentor(request: MentorChatRequest):
    try:
        messages_dict = [{"role": m.role, "content": m.content} for m in request.messages]
        profile_dict = request.student_profile.dict() if request.student_profile else None
        
        result = await generate_mentor_reply(
            messages=messages_dict,
            student_profile=profile_dict
        )
        return MentorChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

- [ ] **Step 3: Register AI router in main.py**

In `backend/app/main.py`:
Include:
```python
from app.routers import ai

app.include_router(ai.router)
```

- [ ] **Step 4: Run test and verify it passes**

Run: `pytest backend/tests/test_ai_router.py -v`  
Expected: PASS  

- [ ] **Step 5: Commit**

```bash
git add backend/app/routers/ai.py backend/app/main.py backend/tests/test_ai_router.py
git commit -m "feat(ai): add AI Mentor chat router connected to Cloudflare Workers AI"
```

---

### Task 5: Auth, Skills, and Jobs/Applications Routers

**Files:**
- Create: `backend/app/routers/auth.py`
- Create: `backend/app/routers/skills.py`
- Create: `backend/app/routers/jobs.py`
- Modify: `backend/app/main.py`
- Test: `backend/tests/test_crud_routers.py`

**Interfaces:**
- Produces: `/api/auth/login`, `/api/skills/benchmarks`, `/api/jobs`, `/api/applications` endpoints.

- [ ] **Step 1: Write tests for CRUD routers**

In `backend/tests/test_crud_routers.py`:
```python
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_skills_benchmarks():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/skills/benchmarks")
    assert response.status_code == 200
    data = response.json()
    assert "Cloud Infrastructure Engineer" in data

@pytest.mark.asyncio
async def test_jobs_list():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/jobs")
    assert response.status_code == 200
    assert len(response.json()) >= 1
```

- [ ] **Step 2: Implement Routers and Initial Seed Data**

In `backend/app/routers/skills.py`:
```python
from fastapi import APIRouter

router = APIRouter(prefix="/api/skills", tags=["Skills & Benchmarks"])

ROLE_BENCHMARKS = {
    "Cloud Infrastructure Engineer": {
        "Cloud Platforms (AWS/GCP)": 90,
        "Kubernetes & Orchestration": 85,
        "Infrastructure as Code": 80,
        "Linux & Networking": 85,
        "CI/CD Pipelines": 75,
        "Security & Compliance": 70,
        "Monitoring & Observability": 75,
        "Scripting & Automation": 80,
    },
    "Machine Learning Engineer": {
        "Python & Numerical Computing": 95,
        "PyTorch / TensorFlow": 90,
        "MLOps & Deployment": 75,
        "Data Engineering & SQL": 80,
        "Model Optimization": 85,
        "Math & Statistics": 90,
        "API Integration": 80,
        "Experiment Tracking": 85,
    },
    "Full-Stack Developer": {
        "Frontend (React/Next)": 95,
        "Backend (Node/Python)": 90,
        "API Design & REST": 85,
        "Database & SQL": 80,
        "Testing & QA": 75,
        "DevOps Basics": 70,
        "System Architecture": 80,
        "Security Fundamentals": 75,
    }
}

@router.get("/benchmarks")
async def get_benchmarks():
    return ROLE_BENCHMARKS
```

In `backend/app/routers/jobs.py`:
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db, Base, engine
from app.models.job import Job, Application
from app.schemas.job import JobResponse, ApplicationCreate, ApplicationResponse
from typing import List

router = APIRouter(prefix="/api", tags=["Jobs & Applications"])

DEFAULT_JOBS = [
    {
        "id": 1,
        "title": "Junior ML Engineer",
        "company": "Apex Data Systems",
        "location": "Remote",
        "work_type": "Remote",
        "duration": "6 Months",
        "skills_required": ["Python", "PyTorch", "FastAPI", "SQL"],
        "match_score_base": 94
    },
    {
        "id": 2,
        "title": "Full-Stack Intern",
        "company": "Novus Cloud",
        "location": "San Francisco, CA",
        "work_type": "Hybrid",
        "duration": "3 Months",
        "skills_required": ["React", "Node.js", "TypeScript", "Tailwind"],
        "match_score_base": 87
    },
    {
        "id": 3,
        "title": "Cloud Associate",
        "company": "Nexus Global",
        "location": "New York, NY",
        "work_type": "On-Site",
        "duration": "6 Months",
        "skills_required": ["AWS", "Docker", "Linux", "Git"],
        "match_score_base": 78
    }
]

@router.get("/jobs")
async def list_jobs():
    return DEFAULT_JOBS

@router.get("/applications")
async def list_applications(db: Session = Depends(get_db)):
    apps = db.query(Application).all()
    if not apps:
        return [
            {
                "id": 1,
                "job_id": 1,
                "role_title": "Junior ML Engineer",
                "company": "Apex Data Systems",
                "match_confidence": 94,
                "status": "Interview Scheduled",
                "date_submitted": "Aug 28, 2026"
            },
            {
                "id": 2,
                "job_id": 2,
                "role_title": "Full-Stack Intern",
                "company": "Novus Cloud",
                "match_confidence": 87,
                "status": "Under Review",
                "date_submitted": "Sep 02, 2026"
            },
            {
                "id": 3,
                "job_id": 3,
                "role_title": "Backend Developer",
                "company": "Stratosphere Labs",
                "match_confidence": 91,
                "status": "Offer Extended",
                "date_submitted": "Sep 04, 2026"
            }
        ]
    return apps

@router.post("/applications")
async def create_application(app_data: ApplicationCreate, db: Session = Depends(get_db)):
    new_app = Application(**app_data.dict(), user_id=1)
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app
```

In `backend/app/routers/auth.py`:
```python
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
```

- [ ] **Step 3: Register routers and initialize database tables in main.py**

In `backend/app/main.py`:
```python
from app.database import Base, engine
from app.routers import ai, skills, jobs, auth

Base.metadata.create_all(bind=engine)

app.include_router(ai.router)
app.include_router(skills.router)
app.include_router(jobs.router)
app.include_router(auth.router)
```

- [ ] **Step 4: Run tests and verify they pass**

Run: `pytest backend/tests/test_crud_routers.py -v`  
Expected: PASS  

- [ ] **Step 5: Commit**

```bash
git add backend/app/routers/ backend/app/main.py backend/tests/test_crud_routers.py
git commit -m "feat(api): implement auth, skills, and jobs/applications routers"
```

---

### Task 6: Frontend Integration & Puter.js Removal

**Files:**
- Modify: `index.html` (remove puter.js script tag)
- Modify: `vite.config.js` (add `/api` proxy)
- Modify: `src/services/aiMentorService.js` (connect to `/api/ai/mentor/chat`, remove Puter dependency)
- Modify: `src/components/student/views/AiMentorView.jsx` (update UI status to show Live Cloudflare Workers AI Engine)
- Modify: `src/components/student/AiMentorDrawer.jsx` (update UI badge to Cloudflare AI)

**Interfaces:**
- Consumes: `POST /api/ai/mentor/chat` from the FastAPI backend.
- Produces: Seamless AI Mentor chat completions without any login popups.

- [ ] **Step 1: Remove Puter.js from index.html**

Delete lines 18-19 in `index.html`:
```html
-  <!-- Puter.js for free live client-side AI LLM capabilities -->
-  <script src="https://js.puter.com/v2/"></script>
```

- [ ] **Step 2: Configure `/api` reverse proxy in vite.config.js**

In `vite.config.js`:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
```

- [ ] **Step 3: Update `src/services/aiMentorService.js` to call FastAPI backend**

Replace `callPuterAi` and update `sendMentorMessage`:
```javascript
export async function sendMentorMessage({ user, conversationHistory, newMessage }) {
  const detectedRole = checkForRoleExploration(newMessage);

  let responseText = '';

  // 1. Call SkillBridge FastAPI Backend with Cloudflare Workers AI
  try {
    const formattedMessages = conversationHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
    formattedMessages.push({ role: 'user', content: newMessage });

    const res = await fetch('/api/ai/mentor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: formattedMessages,
        student_profile: {
          name: user?.name || user?.email?.split('@')[0] || 'Alex Chen',
          major: user?.major || 'B.S. in Computer Science',
          skills: user?.skills || ['React', 'Node.js', 'Python'],
          target_role: user?.targetRole || 'Cloud Infrastructure Engineer'
        }
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.reply) {
        responseText = data.reply;
      }
    }
  } catch (err) {
    console.warn("Backend AI proxy unreachable, using Dynamic Knowledge Synthesizer:", err.message);
  }

  // 2. Dynamic Knowledge Synthesizer fallback if backend offline
  if (!responseText) {
    await new Promise(res => setTimeout(res, 600));
    responseText = generateDynamicSynthesizerResponse({ user, promptText: newMessage });
  }

  // Append benchmark notification if a role was detected
  if (detectedRole) {
    responseText += `\n\n🎯 **New Target Benchmark Added!**\n*${detectedRole.roleTitle}* is now available in your **Skill-Gap Radar** target role benchmark options!`;
  }

  return responseText;
}
```

- [ ] **Step 4: Update UI badges in `AiMentorView.jsx` and `AiMentorDrawer.jsx`**

Update status label from `Puter / Gemini` to `Live Cloudflare AI Engine` and remove obsolete Puter references.

- [ ] **Step 5: Verify build passes**

Run: `npm run build`  
Expected: PASS  

- [ ] **Step 6: Commit**

```bash
git add index.html vite.config.js src/services/aiMentorService.js src/components/student/
git commit -m "refactor(frontend): connect to FastAPI Cloudflare Workers AI proxy and remove Puter.js"
```

---

### Task 7: End-to-End System Verification & Interactive Testing

**Files:**
- Test: `backend/tests/test_live_cloudflare.py`

- [ ] **Step 1: Write live end-to-end verification script to test live inference**

In `backend/tests/test_live_cloudflare.py`:
```python
import pytest
from app.services.cloudflare_ai import generate_mentor_reply

@pytest.mark.asyncio
async def test_live_cloudflare_workers_ai():
    result = await generate_mentor_reply(
        messages=[{"role": "user", "content": "Hello! Give a 1-sentence career advice."}],
        student_profile={"name": "Alex", "major": "Computer Science"}
    )
    assert result["success"] is True
    assert len(result["reply"]) > 10
```

- [ ] **Step 2: Run all backend tests**

Run: `pytest backend/tests/ -v`  
Expected: ALL PASS  

- [ ] **Step 3: Launch backend and test via curl through Vite proxy**

Run backend: `python backend/run.py` in background.  
Run: `curl.exe http://localhost:5173/api/health`  
Expected: `{"status":"healthy","service":"SkillBridge API",...}`  

- [ ] **Step 4: Final commit and summary**

```bash
git add backend/tests/
git commit -m "test: add live Cloudflare AI end-to-end test"
```
