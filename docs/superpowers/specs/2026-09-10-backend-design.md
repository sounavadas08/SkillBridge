# SkillBridge FastAPI Backend & Cloudflare Workers AI Architecture Specification

**Date:** 2026-09-10  
**Project:** SkillBridge (Academia-Industry Integration Platform)  
**Status:** Approved by User  

---

## 1. System Overview

SkillBridge currently features a React 18 + Vite frontend with student/recruiter flows, a skill gap radar chart, curated job recommendations, and an AI Mentor studio. Previously, client-side LLM interactions relied on Puter.js, which triggered disruptive external login dialogs that degraded the user experience.

This specification defines the architecture and implementation of a dedicated **Python + FastAPI** backend service. The backend will:
1. Securely interface with **Cloudflare Workers AI** using the user's static API token and Account ID, providing high-speed, login-free LLM completions to the frontend.
2. Provide a lightweight, zero-configuration **SQLite database via SQLAlchemy** for users, skill profiles, job listings, and application tracking.
3. Integrate with the Vite development server via reverse proxy (`/api`), preventing CORS restrictions and securing API credentials within environment variables.
4. Cleanly eliminate Puter.js from `index.html` and the client codebase.

---

## 2. Technology Stack & Infrastructure

* **Runtime:** Python 3.13+
* **Framework:** FastAPI (asynchronous ASGI framework over Starlette and Pydantic)
* **ASGI Server:** Uvicorn
* **HTTP Client:** HTTPX (async client with connection pooling)
* **Database & ORM:** SQLite (`skillbridge.db`) with SQLAlchemy 2.0+
* **Environment Configuration:** Pydantic Settings / `python-dotenv`
* **AI Provider:** Cloudflare Workers AI
  * **Endpoint:** `https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/ai/v1/chat/completions`
  * **Primary Model:** `@cf/meta/llama-3.1-8b-instruct-fp8`
  * **Account ID:** `dbd7f38dcfb51b94ad28e75091154a23`
  * **Authentication:** Bearer Token via `CLOUDFLARE_API_TOKEN`
* **Frontend Proxy:** Vite dev server configured to route `/api/*` -> `http://127.0.0.1:8000`

---

## 3. Directory & File Structure

```text
skillBridge/
├── backend/
│   ├── .env                      # Secret credentials (ignored in git)
│   ├── .env.example              # Template credentials
│   ├── requirements.txt          # Python dependencies
│   ├── run.py                    # Startup script: uvicorn app.main:app --reload --port 8000
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI initialization, CORS, routing
│   │   ├── config.py             # App settings loaded from .env
│   │   ├── database.py           # SQLAlchemy SQLite engine & sessionmaker
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py           # User model (Student / Recruiter)
│   │   │   ├── skill.py          # SkillProfile & RoleBenchmark models
│   │   │   └── job.py            # Job & Application models
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── ai.py             # Request/Response schemas for AI Mentor
│   │   │   ├── user.py           # Auth & profile schemas
│   │   │   └── job.py            # Job & Application schemas
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── cloudflare_ai.py  # Async Cloudflare Workers AI client
│   │   │   └── skill_engine.py   # Skill gap & match confidence calculations
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── ai.py             # /api/ai endpoints
│   │       ├── auth.py           # /api/auth endpoints
│   │       ├── skills.py         # /api/skills endpoints
│   │       └── jobs.py           # /api/jobs & /api/applications endpoints
├── src/                          # Existing React frontend
│   ├── services/
│   │   ├── aiMentorService.js    # Refactored to call /api/ai/mentor/chat
│   │   └── api.js                # Core Axios/fetch HTTP client for backend
├── index.html                    # Removed puter.js script tag
└── vite.config.js                # Proxy configuration for /api
```

---

## 4. Cloudflare Workers AI Integration

### 4.1 Client Implementation (`backend/app/services/cloudflare_ai.py`)
* The service encapsulates an `httpx.AsyncClient` targeting Cloudflare's OpenAI-compatible completions API.
* Handles timeouts (default 15 seconds) and status code validation.
* Returns normalized JSON structure:
  ```json
  {
    "reply": "Assistant generated markdown response...",
    "model": "@cf/meta/llama-3.1-8b-instruct-fp8",
    "usage": { "prompt_tokens": 45, "completion_tokens": 80 }
  }
  ```

### 4.2 Prompt Engineering & Career Context
* Career Mentor System Prompt embeds:
  * Student persona (e.g., Alex Chen, B.S. Computer Science).
  * Current technical strengths (e.g., React, Node.js).
  * Targeted role benchmarks (e.g., Cloud Infrastructure Engineer, ML Engineer).
  * Explicit instructions to format outputs with clear markdown, bullet points, and code blocks.
* Automated Role Benchmark Detection: If a student asks about a specific new career path (e.g., "Tell me about DevOps"), the service flags the new role title so the frontend can offer it as a benchmark in the Skill-Gap Radar chart.

### 4.3 Fallback & Resilience
* In the event of network connectivity interruptions or upstream API hiccups, the backend implements an algorithmic Fallback Synthesizer that returns structured guidance based on local skill taxonomies, ensuring 100% uptime for the user.

---

## 5. Database Schema & Data Models

Using SQLAlchemy ORM with SQLite:

### 5.1 `users` Table
* `id` (Integer, Primary Key)
* `email` (String, Unique, Indexed)
* `hashed_password` (String)
* `name` (String)
* `role` (String: `'student'` | `'recruiter'`)
* `organization` (String: University or Company name)
* `department` (String: Major or Department)
* `created_at` (DateTime, default UTC now)

### 5.2 `skill_profiles` Table
* `id` (Integer, Primary Key)
* `user_id` (Integer, Foreign Key to `users.id`)
* `target_role` (String, default `'Cloud Infrastructure Engineer'`)
* `competencies` (JSON: Dictionary of 8 core competencies and 0-100 scores)
* `updated_at` (DateTime)

### 5.3 `jobs` Table
* `id` (Integer, Primary Key)
* `title` (String)
* `company` (String)
* `location` (String)
* `work_type` (String: `'Remote'` | `'Hybrid'` | `'On-Site'`)
* `duration` (String)
* `skills_required` (JSON: List of skill strings)
* `match_score_base` (Integer)

### 5.4 `applications` Table
* `id` (Integer, Primary Key)
* `job_id` (Integer, Foreign Key to `jobs.id`)
* `user_id` (Integer, Foreign Key to `users.id`)
* `match_confidence` (Integer)
* `status` (String: `'Interview Scheduled'` | `'Under Review'` | `'Offer Extended'`)
* `date_submitted` (String)

---

## 6. API Specifications

### 6.1 AI Mentor
* **`POST /api/ai/mentor/chat`**
  * **Payload:**
    ```json
    {
      "messages": [
        { "role": "user", "content": "How do I improve my Docker and Kubernetes skills?" }
      ],
      "student_profile": {
        "name": "Alex Chen",
        "major": "B.S. in Computer Science",
        "skills": ["React", "Node.js", "Python"],
        "target_role": "Cloud Infrastructure Engineer"
      }
    }
    ```
  * **Response:**
    ```json
    {
      "reply": "To advance your Docker and Kubernetes competencies...",
      "detected_role": null,
      "model_used": "@cf/meta/llama-3.1-8b-instruct-fp8"
    }
    ```

### 6.2 Authentication
* **`POST /api/auth/register`**: Registers student or recruiter account and returns user token.
* **`POST /api/auth/login`**: Authenticates user credentials.
* **`GET /api/auth/me`**: Returns current session details.

### 6.3 Skill-Gap & Roles
* **`GET /api/skills/benchmarks`**: Returns standard 8-axis benchmarks for available roles.
* **`GET /api/skills/profile`**: Returns current student's skill gap breakdown and overall readiness percentage (e.g. 74%).
* **`POST /api/skills/profile`**: Updates student competencies.

### 6.4 Opportunities & Pipeline
* **`GET /api/jobs`**: Returns available job opportunities with calculated match scores for the active student.
* **`GET /api/applications`**: Returns the student's active application lifecycle table.
* **`POST /api/applications`**: Submits an application and triggers toast feedback.

---

## 7. Frontend Integration Changes

1. **`index.html`**:
   * Remove line 18-19:
     ```html
     <!-- Puter.js for free live client-side AI LLM capabilities -->
     <script src="https://js.puter.com/v2/"></script>
     ```
2. **`vite.config.js`**:
   * Configure proxy:
     ```javascript
     server: {
       proxy: {
         '/api': {
           target: 'http://127.0.0.1:8000',
           changeOrigin: true,
           secure: false,
         }
       }
     }
     ```
3. **`src/services/aiMentorService.js`**:
   * Update `sendMentorMessage` to call `POST /api/ai/mentor/chat`.
   * Completely bypass any Puter prompts or window object checks.
   * Provide seamless fallback to local synthesis if backend is offline.

---

## 8. Verification & Testing

1. **Unit & Integration Testing**:
   * Create test suite under `backend/tests/` using `pytest`.
   * Test `/api/ai/mentor/chat` using mocked and live Cloudflare responses.
   * Verify schema validation handles invalid payloads with HTTP 422.
2. **End-to-End Verification**:
   * Launch backend via `python run.py`.
   * Verify Swagger UI loads at `http://127.0.0.1:8000/docs`.
   * Send chat messages in the frontend AI Mentor Studio and verify instant Llama 3.1 responses without Puter login modals.
   * Confirm Vite proxy routes API requests without CORS issues.
