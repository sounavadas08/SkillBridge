# Multi-Page Application (MPA) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform SkillBridge into a Multi-Page Application (MPA) with 4 physical HTML pages (`index.html`, `login.html`, `onboarding.html`, `portal.html`) and intra-portal hash history so backward and forward browser navigation never throws users out of the website.

**Architecture:** Use Vite multi-page configuration with 4 entry HTML files mapping to dedicated React entry scripts. Implement a lightweight navigation utility for cross-page routing and synchronize portal tabs with `window.location.hash` and `popstate` events to preserve full browser history.

**Tech Stack:** React 18, Vite 6, Tailwind CSS, Lucide React, HTML5 History / Hash API, FastAPI Backend (proxy).

## Global Constraints
- Do not break existing features: Cloudflare AI Mentor, SkillVault avatar upload, radar charts, and job matchers must remain fully functional.
- Zero external CSS/routing regressions: maintain theme and toast contexts across all entry pages.
- Support both explicit `.html` URLs (`/portal.html`) and clean URLs (`/portal`).

---

### Task 1: Vite Multi-Page Configuration

**Files:**
- Modify: `vite.config.js`
- Test: `tests/test_vite_config.js` (validation script)

**Interfaces:**
- Consumes: Vite Rollup `input` options
- Produces: 4 HTML bundles (`main`, `login`, `onboarding`, `portal`) and dev middleware for clean URLs

- [ ] **Step 1: Write verification script to test multi-page configuration**

Create `scripts/verify-mpa-config.js`:
```javascript
import fs from 'fs';
import { defineConfig } from 'vite';

const configContent = fs.readFileSync('vite.config.js', 'utf-8');
if (!configContent.includes('login.html') || !configContent.includes('portal.html')) {
  console.error('FAIL: vite.config.js missing multi-page rollup inputs');
  process.exit(1);
}
console.log('PASS: vite.config.js contains multi-page inputs');
```

- [ ] **Step 2: Run verification script to confirm failure**

Run: `node scripts/verify-mpa-config.js`
Expected: FAIL

- [ ] **Step 3: Update `vite.config.js` with Rollup inputs and clean URL middleware**

```javascript
import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'html-rewrite-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url.split('?')[0];
          if (url === '/login') req.url = '/login.html';
          else if (url === '/onboarding') req.url = '/onboarding.html';
          else if (url === '/portal') req.url = '/portal.html';
          next();
        });
      },
    },
  ],
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

- [ ] **Step 4: Run verification script to confirm pass**

Run: `node scripts/verify-mpa-config.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add vite.config.js scripts/verify-mpa-config.js
git commit -m "chore: configure vite multi-page rollup inputs and url rewrites"
```

---

### Task 2: Navigation & Session Utility

**Files:**
- Create: `src/utils/navigation.js`
- Create: `src/utils/__tests__/navigation.test.js`

**Interfaces:**
- Consumes: `window.location`, `localStorage`
- Produces:
  - `navigateTo(path)`: Navigates cleanly between pages (`/login.html`, `/portal.html`, etc.)
  - `getCurrentUser()`: Returns parsed user from `localStorage`
  - `setCurrentUser(user)`: Saves user to `localStorage`
  - `clearCurrentUser()`: Removes user from `localStorage`
  - `getPortalTab(defaultTab)`: Reads initial tab from `window.location.hash`
  - `setPortalTab(tabId)`: Pushes hash to history without page reload

- [ ] **Step 1: Write failing unit test for navigation utilities**

Create `src/utils/__tests__/navigation.test.js`:
```javascript
import { getPortalTab, setPortalTab } from '../navigation.js';

describe('Navigation Utils', () => {
  test('reads hash as portal tab', () => {
    window.location.hash = '#skillvault';
    expect(getPortalTab('command-center')).toBe('skillvault');
  });

  test('falls back to default if hash is empty', () => {
    window.location.hash = '';
    expect(getPortalTab('command-center')).toBe('command-center');
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `node -e "import('./src/utils/navigation.js').catch(e => { console.log('Expected failure'); process.exit(0); })"`
Expected: File not found or failure

- [ ] **Step 3: Implement `src/utils/navigation.js`**

```javascript
export const ROUTES = {
  HOME: '/index.html',
  LOGIN: '/login.html',
  ONBOARDING: '/onboarding.html',
  PORTAL: '/portal.html',
};

export function navigateTo(path) {
  window.location.assign(path);
}

export function getCurrentUser() {
  try {
    const saved = localStorage.getItem('skillbridge_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  try {
    localStorage.setItem('skillbridge_user', JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user:', e);
  }
}

export function clearCurrentUser() {
  localStorage.removeItem('skillbridge_user');
}

export function getPortalTab(defaultTab = 'command-center') {
  const hash = window.location.hash.replace(/^#/, '').trim();
  return hash || defaultTab;
}

export function setPortalTab(tabId) {
  if (!tabId) return;
  if (window.location.hash.replace(/^#/, '') !== tabId) {
    window.location.hash = tabId;
  }
}
```

- [ ] **Step 4: Run test to verify passes**

Run: `node -e "import('./src/utils/navigation.js').then(m => { console.log('PASS: navigation.js loads successfully'); process.exit(0); })"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/navigation.js
git commit -m "feat: add centralized navigation and session persistence utilities"
```

---

### Task 3: Physical HTML Entry Pages

**Files:**
- Modify: `index.html` (mounts `/src/entries/landing.jsx`)
- Create: `login.html` (mounts `/src/entries/login.jsx`)
- Create: `onboarding.html` (mounts `/src/entries/onboarding.jsx`)
- Create: `portal.html` (mounts `/src/entries/portal.jsx`)

**Interfaces:**
- Consumes: Head fonts, Tailwind script, theme attribute
- Produces: Dedicated `#root` DOM containers and module script links

- [ ] **Step 1: Write test script to verify existence of all 4 HTML files**

Create `scripts/verify-html-files.js`:
```javascript
import fs from 'fs';

const pages = ['index.html', 'login.html', 'onboarding.html', 'portal.html'];
for (const p of pages) {
  if (!fs.existsSync(p)) {
    console.error(`FAIL: ${p} does not exist`);
    process.exit(1);
  }
}
console.log('PASS: All 4 HTML files exist');
```

- [ ] **Step 2: Run verification script to confirm failure**

Run: `node scripts/verify-html-files.js`
Expected: FAIL (`login.html does not exist`)

- [ ] **Step 3: Update `index.html` and create `login.html`, `onboarding.html`, and `portal.html`**

All HTML files share consistent fonts, favicon, and Tailwind configuration, pointing to their respective entry scripts:
- `index.html` -> `<script type="module" src="/src/entries/landing.jsx"></script>`
- `login.html` -> `<script type="module" src="/src/entries/login.jsx"></script>`
- `onboarding.html` -> `<script type="module" src="/src/entries/onboarding.jsx"></script>`
- `portal.html` -> `<script type="module" src="/src/entries/portal.jsx"></script>`

- [ ] **Step 4: Run verification script to confirm pass**

Run: `node scripts/verify-html-files.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add index.html login.html onboarding.html portal.html scripts/verify-html-files.js
git commit -m "feat: create dedicated HTML documents for multi-page routing"
```

---

### Task 4: Dedicated React Page Components & Entry Scripts

**Files:**
- Create: `src/entries/landing.jsx`, `src/entries/login.jsx`, `src/entries/onboarding.jsx`, `src/entries/portal.jsx`
- Create: `src/pages/LandingPage.jsx`, `src/pages/LoginPage.jsx`, `src/pages/OnboardingPage.jsx`, `src/pages/PortalPage.jsx`
- Modify: `src/components/main/Navbar.jsx` (use `navigateTo(ROUTES.LOGIN)`, `navigateTo(ROUTES.PORTAL)`, etc.)
- Modify: `src/components/student/StudentPortalLayout.jsx` (sync `activeTab` with `window.location.hash` and `popstate`)

**Interfaces:**
- Consumes: `src/utils/navigation.js`, `ThemeProvider`, `ToastProvider`
- Produces: Distinct pages with seamless inter-page and intra-portal navigation

- [ ] **Step 1: Implement Entry Scripts in `src/entries/`**

Each entry mounts its page component wrapped in `ThemeProvider` and `ToastProvider`.

- [ ] **Step 2: Implement `src/pages/LandingPage.jsx`**

Renders `Navbar`, `Hero`, `StatsStrip`, `PlatformArchitecture`, `CuratedMatches`, `SkillGapEngine`, `ApplicationTracker`, `CTASection`, and `Footer`.
Connects action buttons:
- Sign In -> `/login.html`
- Get Started -> `/onboarding.html`
- Portal / Dashboard -> `/portal.html`

- [ ] **Step 3: Implement `src/pages/LoginPage.jsx`**

Renders `LoginView`.
On login success -> saves user and navigates to `/portal.html`.
On "New User" -> navigates to `/onboarding.html`.
On "Back to Home" -> navigates to `/index.html`.

- [ ] **Step 4: Implement `src/pages/OnboardingPage.jsx`**

Reads role from `window.location.search`.
Renders `OnboardingView`.
On onboarding complete -> saves user and navigates to `/portal.html`.
On "Sign In" -> navigates to `/login.html`.
On "Back to Home" -> navigates to `/index.html`.

- [ ] **Step 5: Implement `src/pages/PortalPage.jsx` & Hash Navigation in `StudentPortalLayout.jsx`**

- Checks `getCurrentUser()`. If missing, falls back to default student profile or redirects.
- In `StudentPortalLayout.jsx`, initialize `activeTab` from `getPortalTab()`.
- On tab switch: `setPortalTab(newTab)`.
- Add `popstate` / `hashchange` listener in `useEffect` so pressing browser Back updates `activeTab` smoothly.
- Back to Home button navigates to `/index.html`.
- Sign Out button calls `clearCurrentUser()` and navigates to `/index.html`.

- [ ] **Step 6: Update `Navbar.jsx` to use direct navigation**

Update link click handlers in `Navbar.jsx` to navigate to `/login.html`, `/onboarding.html`, `/portal.html`, and `/index.html`.

- [ ] **Step 7: Commit**

```bash
git add src/entries/ src/pages/ src/components/
git commit -m "feat: implement dedicated page components and portal tab history sync"
```

---

### Task 5: End-to-End Verification & Testing

**Files:**
- Test: `npm run build`
- Test: `backend/tests/`
- Test: Browser verification of `/index.html`, `/login.html`, `/onboarding.html`, `/portal.html`

- [ ] **Step 1: Run Vite Production Build**

Run: `npm run build`
Expected: Successful build creating `dist/index.html`, `dist/login.html`, `dist/onboarding.html`, `dist/portal.html`.

- [ ] **Step 2: Run Backend Pytest Suite**

Run: `.\backend\venv\Scripts\pytest`
Expected: All 12 tests pass.

- [ ] **Step 3: Verify HTTP responses for all 4 pages via dev server**

Run script to fetch `http://localhost:5173/`, `http://localhost:5173/login.html`, `http://localhost:5173/onboarding.html`, and `http://localhost:5173/portal.html`.
Expected: All respond HTTP 200 OK.

- [ ] **Step 4: Commit and finalize**

```bash
git add -A
git commit -m "test: verify multi-page application bundling and routing"
```
