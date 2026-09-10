# Specification: Database Integration & Role Persistence (Students, Recruiters, Admin)

**Date**: 2026-09-11  
**Project**: SkillBridge Academia-Industry Integration Platform  
**Status**: Approved (Draft to Spec)

---

## 1. Overview & Objectives

SkillBridge currently has a rich multi-page frontend and a FastAPI backend (`backend/app`) running SQLite with partial endpoints. Authentication is predominantly mock/local in the UI.

This specification defines the complete database persistence and role-based authentication system:
1. **Persistent Data Storage**: Store accounts and detailed profiles for **Students (Users)**, **Recruiters (Employers)**, and **Administrators** in SQLite (`skillbridge.db`) via SQLAlchemy.
2. **Cryptographic Security**: Passwords hashed with `bcrypt` via `passlib`; stateless sessions authenticated with signed HS256 JWT tokens.
3. **Role-Based Access Control (RBAC)**: Distinct permissions and tailored portal dashboards for `student`, `recruiter`, and `admin`.
4. **End-to-End Frontend Integration**: Real register/login on `login.html`, database-driven profile completion in `onboarding.html`, and role-gated views in `portal.html`.

---

## 2. Architecture & Database Schemas

### 2.1 Engine & Connection
- **ORM**: SQLAlchemy declarative models.
- **Database Engine**: SQLite (`sqlite:///./skillbridge.db`) locally with `check_same_thread=False`. Fully swappable to PostgreSQL via `DATABASE_URL` environment variable.
- **Migration / Table Provisioning**: Automatic column & table sync during `init_db()` upon backend startup.

---

### 2.2 Relational Data Models

#### A. `users` Table (Core Authentication & Identity)
```python
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="student") # "student" | "recruiter" | "admin"
    avatar = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_login = Column(DateTime, nullable=True)

    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    recruiter_profile = relationship("RecruiterProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    jobs_posted = relationship("Job", back_populates="recruiter", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")
```

#### B. `student_profiles` Table (1-to-1 with `users`)
```python
class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    university = Column(String, default="Tech University")
    department = Column(String, default="Computer Science Major")
    grad_year = Column(String, default="2025")
    specialization = Column(String, default="Software Engineering & AI Systems")
    bio = Column(Text, nullable=True)
    career_stage = Column(String, nullable=True) # e.g. "Undergraduate", "Final Year"
    interests = Column(JSON, default=list)        # e.g. ["React", "AI Engineering", "Cloud Infra"]
    experience_level = Column(String, nullable=True)
    student_goal = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)

    user = relationship("User", back_populates="student_profile")
```

#### C. `recruiter_profiles` Table (1-to-1 with `users`)
```python
class RecruiterProfile(Base):
    __tablename__ = "recruiter_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    company_name = Column(String, default="TechVentures Labs")
    industry = Column(String, default="Cloud & AI Infrastructure")
    company_size = Column(String, default="50-250 Employees")
    website = Column(String, nullable=True)
    hiring_needs = Column(JSON, default=list)   # e.g. ["Full Stack", "Data Engineer"]
    hiring_skills = Column(JSON, default=list)  # e.g. ["React", "Python", "Docker"]
    hiring_goal = Column(String, nullable=True)

    user = relationship("User", back_populates="recruiter_profile")
```

#### D. `jobs` Table (Recruiter Job Postings)
```python
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
```

#### E. `applications` Table (Student Applications)
```python
class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role_title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    match_confidence = Column(Integer, default=90)
    status = Column(String, default="Under Review") # "Applied", "Under Review", "Shortlisted", "Accepted", "Rejected"
    date_submitted = Column(String, nullable=False)

    student = relationship("User", back_populates="applications")
    job = relationship("Job")
```

---

### 2.3 Seed Data (Automated on `init_db`)
To allow instant out-of-the-box testing, `init_db()` will seed initial accounts if they do not exist:
1. **Admin**:
   - Email: `admin@skillbridge.edu`
   - Password: `adminpassword123` (hashed with bcrypt)
   - Role: `admin`
   - Name: `System Administrator`
2. **Student Demo**:
   - Email: `alex.chen@university.edu`
   - Password: `student123`
   - Role: `student`
   - Name: `Alex Chen`
3. **Recruiter Demo**:
   - Email: `recruiter@techventures.io`
   - Password: `recruiter123`
   - Role: `recruiter`
   - Name: `Sarah Jenkins (TechVentures)`

---

## 3. Security, Authentication & Endpoints

### 3.1 Security Specifications
- **Password Hasher**: `passlib.context.CryptContext(schemes=["bcrypt"], deprecated="auto")`.
- **JWT Provider**: HS256 algorithm with 7-day token expiration. Key loaded from `JWT_SECRET_KEY` (fallback: `skillbridge-super-secret-jwt-key-2026`).
- **Authorization Header**: `Authorization: Bearer <token>`.
- **FastAPI Dependency**: `get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User`.

### 3.2 Endpoint Definitions

#### Auth (`/api/auth`)
| Method | Path | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | No | Creates new `User` and empty profile. Returns `{ token, user }`. |
| `POST` | `/api/auth/login` | No | Validates email + password. Returns `{ token, user }`. |
| `GET` | `/api/auth/me` | Bearer Token | Returns current authenticated user and profile object. |
| `PUT` | `/api/auth/profile` | Bearer Token | Updates role-specific profile data for current user. |

#### Recruiter (`/api/recruiter`)
| Method | Path | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/recruiter/jobs` | `recruiter` \| `admin` | Retrieves jobs posted by recruiter. |
| `POST` | `/api/recruiter/jobs` | `recruiter` | Creates a new job posting. |
| `GET` | `/api/recruiter/applicants` | `recruiter` \| `admin` | Fetches applications submitted to recruiter's jobs. |
| `PATCH`| `/api/recruiter/applicants/{id}/status`| `recruiter` | Updates application status (`Shortlisted`, `Under Review`, etc.). |

#### Admin (`/api/admin`)
| Method | Path | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | `admin` | System KPIs: total students, recruiters, jobs, applications. |
| `GET` | `/api/admin/users` | `admin` | Filterable list of all registered users. |
| `PATCH`| `/api/admin/users/{id}/toggle-status`| `admin` | Deactivates or activates a user account. |
| `DELETE`| `/api/admin/users/{id}` | `admin` | Permanently deletes user and associated profile data. |

---

## 4. Frontend Architecture & Flow

### 4.1 Login & Registration (`src/components/login/LoginView.jsx`)
- Liquid glass tab switcher: **"Sign In"** vs **"Create Account"**.
- **Sign In Tab**:
  - Email & Password fields.
  - "Quick fill" chips for `Student Demo`, `Recruiter Demo`, and `Admin Demo`.
  - Submitting calls `POST /api/auth/login`.
- **Create Account Tab**:
  - Full Name, Email, Password, and Role Selector (`Student / Candidate` or `Recruiter / Employer`).
  - Submitting calls `POST /api/auth/register` and routes directly to `/onboarding.html`.

### 4.2 Onboarding Experience (`src/components/login/OnboardingView.jsx`)
- 5-step interactive questionnaire for either Student or Recruiter branch.
- On step 5 completion:
  - Invokes `PUT /api/auth/profile` sending answered options (career stage, interests, hiring goals) directly to backend.
  - Redirects to `/portal.html`.

### 4.3 Role-Gated Portal Dashboards (`src/pages/PortalPage.jsx` & components)
The portal examines `currentUser.role`:
1. **`student`**:
   - Renders `StudentPortalLayout`: Command Center, Smart CV Architect, Curriculum, Skill Gap Radar, Curated Jobs, Applications.
2. **`recruiter`**:
   - Renders `RecruiterPortalLayout`: Active job listings, "Post New Job" modal, Candidate applicants review stream, Company Profile settings.
3. **`admin`**:
   - Renders `AdminPortalLayout`: Metric cards (Total Users, Students, Recruiters, Active Jobs), User Management directory table with search, role filters, status toggle, and delete controls.

### 4.4 Client Session Helper (`src/utils/navigation.js` & `src/utils/api.js`)
- `getAuthToken()`: Retrieves JWT from `localStorage`.
- `setAuthToken(token)`: Persists JWT in `localStorage`.
- `apiFetch(url, options)`: Wrapper around `fetch` that attaches `Authorization: Bearer <token>`, parses JSON, and redirects to `/login.html` if response is `401 Unauthorized`.

---

## 5. Error Handling & Edge Cases
- **Duplicate Email**: Return HTTP 400 with `"An account with this email already exists"`.
- **Invalid Credentials**: Return HTTP 401 with `"Invalid email or password"`.
- **Account Suspended**: Return HTTP 403 with `"Your account has been deactivated. Please contact support."`.
- **Unauthorized Role Access**: Return HTTP 403 with `"Forbidden: Insufficient privileges for this role"`.
- **Network / Server Down**: Frontend displays a graceful toast notification without crashing.

---

## 6. Verification & Testing Plan
1. **Automated Backend Tests**:
   - Test user registration with student and recruiter roles.
   - Test password hashing and authentication with correct and incorrect credentials.
   - Test JWT validation and RBAC guards for student, recruiter, and admin routes.
2. **Manual End-to-End Flow**:
   - Sign in using the Admin demo chip -> verify Admin Dashboard loads with platform stats and user directory.
   - Sign in using the Recruiter demo chip -> verify Recruiter Hub loads, post a test job, and check that it saves to the database.
   - Register a new Student account -> complete Onboarding steps -> verify student profile data is populated in the database.
   - Sign out -> verify session tokens are cleared and user is redirected to login.
