# Multi-Page Application (MPA) & Browser History Navigation Design

## 1. Overview
Currently, SkillBridge operates as a Single-Page Application (SPA) driven by React state (`currentView` and `activeTab`) without browser history integration. Because no browser history entries are pushed when users navigate between the landing page, login, onboarding, or portal views, pressing the browser's **Back** (`←`) or **Forward** (`→`) buttons navigates to external websites or blank tabs, kicking the user out of SkillBridge.

This document specifies the transition to a **Multi-Page Application (MPA)** using dedicated physical HTML entry points in Vite, combined with hash-based history routing for intra-portal tabs. This ensures the browser's Back and Forward buttons navigate smoothly across pages and views within SkillBridge.

---

## 2. Architecture & File Structure

### 2.1 Physical HTML Pages
We will introduce 4 dedicated HTML documents at the root of the project:
1. **`index.html`**: The public landing page showcasing the Hero, Stats, Platform Architecture, Curated Matches, Skill Gap Engine, and CTA.
   - Entry point: `src/entries/landing.jsx` -> `src/pages/LandingPage.jsx`
   - Page Title: *SkillBridge | Bridge the gap between learning and hiring*
2. **`login.html`**: Authentication portal for students and recruiters.
   - Entry point: `src/entries/login.jsx` -> `src/pages/LoginPage.jsx`
   - Page Title: *SkillBridge | Sign In*
3. **`onboarding.html`**: Step-by-step role and profile onboarding wizard.
   - Entry point: `src/entries/onboarding.jsx` -> `src/pages/OnboardingPage.jsx`
   - Page Title: *SkillBridge | Get Started & Onboarding*
4. **`portal.html`**: Student Career Hub and Employer Talent Portal.
   - Entry point: `src/entries/portal.jsx` -> `src/pages/PortalPage.jsx`
   - Page Title: *SkillBridge | Career Portal*

### 2.2 Entry Script & Page Structure
Each entry script (`src/entries/*.jsx`) mounts its respective page component into `#root`, wrapped by global context providers:
- `ThemeProvider`: Ensures consistent light/dark theme across all pages.
- `ToastProvider`: Provides unified notification banners.

---

## 3. Navigation & History Flow

### 3.1 Inter-Page Navigation
Navigation between top-level pages utilizes standard browser page transitions via `window.location.assign()` / `window.location.href`:
- **Landing -> Login**: Clicking "Sign In" navigates to `/login.html`.
- **Landing -> Onboarding**: Clicking "Get Started" navigates to `/onboarding.html` (supporting `?role=student` or `?role=recruiter`).
- **Landing -> Portal**: Clicking "Go to Portal" navigates to `/portal.html`.
- **Login -> Portal**: Upon successful authentication, redirects to `/portal.html`.
- **Login / Onboarding -> Home**: "Back to Home" navigates to `/index.html`.
- **Portal -> Home**: "Landing Page" navigates to `/index.html`.
- **Portal -> Sign Out**: Clears session from `localStorage` and navigates to `/index.html`.

Because these transitions are standard document navigations, the browser history stack natively records each step. Clicking **Back** (`←`) returns the user to the previous page within the site instead of exiting.

### 3.2 Intra-Portal Tab Navigation (`portal.html`)
Within `portal.html`, users navigate between 8 modular tabs:
1. `command-center` (default)
2. `ai-mentor`
3. `skillvault`
4. `radar`
5. `resume`
6. `opportunities`
7. `mock-interviews`
8. `trends`

**Hash & History Integration**:
- When a tab is selected: `window.location.hash = tabId` or `history.pushState(null, '', '#' + tabId)`.
- On initial page load: Reads initial tab from `window.location.hash.replace('#', '')` (falling back to `'command-center'`).
- Listens to `popstate` / `hashchange` events: When the user clicks the browser's Back button while in `portal.html`, the portal transitions back to the previous tab. Once the tab history is exhausted, the browser Back button navigates to the previous page (e.g., `login.html` or `index.html`).

---

## 4. State & Session Management Across Pages

All pages share the same browser origin (`http://localhost:5173`):
1. **User Identity**: Serialized in `localStorage.getItem('skillbridge_user')`.
2. **Backend Sync**: On page load, `portal.html` and `index.html` query `GET /api/auth/profile` to ensure the session matches the FastAPI SQLite database.
3. **Profile Updates**: Modifying profile details or avatar in `SkillVaultView` writes to `localStorage` and calls `PUT /api/auth/profile`. Subsequent visits or navigations immediately reflect the updated state.

---

## 5. Build & Vite Configuration

### 5.1 `vite.config.js` Multi-Page Configuration
Configure Rollup input entries:
```javascript
import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        onboarding: resolve(__dirname, 'onboarding.html'),
        portal: resolve(__dirname, 'portal.html'),
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});
```

### 5.2 Clean URL Rewrites (Optional Dev Enhancement)
Support both clean URLs (`/login`, `/portal`, `/onboarding`) and explicit extensions (`/login.html`, `/portal.html`, `/onboarding.html`) during development via Vite dev server middleware.

---

## 6. Verification Plan

1. **Build Verification**: Run `npm run build` to ensure all 4 HTML entry points bundle cleanly without missing assets or circular dependencies.
2. **Backward / Forward Browser Navigation Test**:
   - Start on `index.html`.
   - Click "Sign In" -> browser navigates to `login.html`.
   - Click "Sign In" with credentials -> browser navigates to `portal.html`.
   - In `portal.html`, click "SkillVault", then "AI Mentor", then "Industry Trends".
   - Click browser **Back** button 3 times: verify it cycles backward through Trends -> AI Mentor -> SkillVault -> Command Center.
   - Click browser **Back** again: verify it returns to `login.html` (or `index.html`), NEVER exiting the website.
   - Click browser **Forward** button: verify it moves forward accurately through the history stack.
3. **Direct URL Loading**: Verify direct loading of `http://localhost:5173/login.html`, `http://localhost:5173/portal.html#skillvault`, and `http://localhost:5173/onboarding.html` renders the expected views.
4. **Backend & Profile Compatibility**: Confirm profile updates in `portal.html#skillvault` persist across navigations.
