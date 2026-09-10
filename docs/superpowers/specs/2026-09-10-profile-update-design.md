# Profile Picture & Profile Data Management Design Specification

**Date:** 2026-09-10  
**Project:** SkillBridge (Academia-Industry Integration Platform)  
**Status:** Approved by User  

---

## 1. System Overview

In SkillBridge, students interact with multiple modules—including SkillVault, Command Center, and AI Mentor Studio. Previously, student profile identity details (name, degree, university, graduation timeline, bio, and avatar picture) were static or read-only mock values.

This specification details the design for enabling full student profile editing and profile picture uploads via two synchronized interaction mechanisms:
1. **Direct Avatar Click & Hover**: A direct hover overlay with a camera badge on the profile photo card allowing instantaneous image uploads from the local filesystem via a file picker.
2. **Edit Profile Modal (`EditProfileModal.jsx`)**: A modal dialog enabling comprehensive updates across personal identity, professional bio, academic milestones, and external social/portfolio links.
3. **Backend Persistence & State Synchronization**: A FastAPI `PUT /api/auth/profile` endpoint paired with SQLite database schema extensions and local browser state synchronization to ensure instant reactivity across all dashboard views.

---

## 2. User Experience & Component Architecture

### 2.1 Direct Avatar File Upload
* **Target**: The circular avatar in `SkillVaultView.jsx` (and optionally `CommandCenterView.jsx`).
* **Interaction**:
  * Hovering over the avatar shows a semi-transparent dark circle (`rgba(0,0,0,0.55)`) with a white `Camera` icon and text *"Change Photo"*.
  * Clicking the avatar triggers an invisible `<input type="file" accept="image/*" />`.
  * When a file is selected, a client-side `FileReader` reads the image into a base64 Data URL.
  * Image is immediately applied to the active user state and persisted, triggering a success notification (*"Profile picture updated!"*).

### 2.2 Edit Profile Action & Trigger
* An **"Edit Profile"** button with a pencil icon is added in `SkillVaultView.jsx` directly below the user title/major in the left identity card.
* Clicking this button opens `EditProfileModal`.

### 2.3 `EditProfileModal.jsx` Form Structure
The modal dialog contains 4 distinct sections:
1. **Avatar Upload Zone**:
   * Circular preview with drag-and-drop file target.
   * Buttons: *"Upload New Photo"* and *"Reset to Default"*.
2. **Identity & Academic Details**:
   * **Full Name** (text input, required).
   * **Major / Headline** (e.g. *"Computer Science Major"*).
   * **Degree Program** (e.g. *"B.S. in Computer Science"*).
   * **University / College** (e.g. *"Tech University"*).
   * **Graduation Years** (e.g. *"2021 - 2025"*).
   * **Specialization / Target Role** (e.g. *"Software Engineering Specialization"*).
3. **Professional Summary**:
   * **Professional Bio** (textarea with character count helper).
4. **Online Presence & Portfolio Links**:
   * **GitHub URL** (with GitHub icon).
   * **LinkedIn URL** (with LinkedIn icon).
   * **Portfolio Website URL** (with Globe icon).

### 2.4 Profile Card Presentation Updates (`SkillVaultView.jsx`)
* Render the updated name, major, degree, university, timeline, and bio.
* Render interactive social link pills (`GitHub`, `LinkedIn`, `Portfolio`) that open external URLs in a new tab when clicked.

---

## 3. Backend Architecture & Database Schema

### 3.1 SQLite `users` Table Extension (`backend/app/models/user.py`)
Add the following columns to the `User` model:
* `avatar`: `Column(String, nullable=True)` — stores base64 data URL or photo URL.
* `bio`: `Column(String, nullable=True)` — multi-sentence professional bio.
* `grad_year`: `Column(String, nullable=True)` — e.g. `"2021 - 2025"`.
* `specialization`: `Column(String, nullable=True)` — specialization or target role.
* `github_url`: `Column(String, nullable=True)` — URL string.
* `linkedin_url`: `Column(String, nullable=True)` — URL string.
* `portfolio_url`: `Column(String, nullable=True)` — URL string.

### 3.2 Pydantic Schemas (`backend/app/schemas/user.py`)
```python
class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    organization: Optional[str] = None
    department: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    grad_year: Optional[str] = None
    specialization: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None

class UserProfileResponse(UserProfileUpdate):
    id: int
```

### 3.3 Auth Endpoints (`backend/app/routers/auth.py`)
* **`GET /api/auth/profile`**:
  * Retrieves the active user record from SQLite. If empty, seeds with the default student profile.
* **`PUT /api/auth/profile`**:
  * Updates the provided profile fields in SQLite.
  * Returns the updated profile record.

---

## 4. Frontend State & Synchronization

1. **Storage Sync**:
   * When updated, save to `localStorage.setItem('skillbridge_student_profile', JSON.stringify(profile))`.
   * On initial load, prioritize stored profile data over default mock data.
2. **Propagating Updates**:
   * Pass an `onUpdateUser(updatedData)` handler from `App.jsx` through `StudentPortalLayout` into `SkillVaultView`.
   * When `onUpdateUser` is called, update the top-level `currentUser` state in `App.jsx` so:
     * Navigation bar displays the updated avatar and name.
     * Command Center header displays the updated avatar, name, and major.
     * SkillVault displays the updated avatar, bio, academic details, and links.

---

## 5. Verification & Testing

1. **Backend Tests**:
   * Add endpoint tests in `backend/tests/test_profile.py` verifying `GET /api/auth/profile` and `PUT /api/auth/profile`.
   * Verify all fields (`avatar`, `bio`, `grad_year`, `specialization`, `github_url`, etc.) save and retrieve accurately.
2. **Frontend Build & UI Testing**:
   * Run `npm run build` to verify clean compilation.
   * Verify avatar file upload converts files to valid Data URLs and updates the UI instantly.
   * Verify modal inputs validate and save successfully with feedback toasts.
