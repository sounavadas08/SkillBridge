# SkillBridge Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pixel-perfect, interactive React frontend for the SkillBridge landing page and platform prototype based on the Figma design.

**Architecture:** Component-driven React architecture built with Vite and Vanilla CSS design tokens. Features custom mathematical SVG radar chart geometry, dynamic theme switching (dark/light), interactive role switching, application status pipeline, and toast feedback.

**Tech Stack:** React 18, Vite, Vanilla CSS custom properties, Lucide-style SVG icons, Google Fonts (Playfair Display / Newsreader & Plus Jakarta Sans).

## Global Constraints
* Exact visual fidelity matching the Figma screenshots (Hero typography with italic mint accent, 4-stat bar, 3-step platform architecture, 3 curated match cards, SVG radar chart with 8 axes, application tracking table, and midnight navy footer).
* Vanilla CSS with CSS custom properties (no TailwindCSS).
* Zero external chart libraries for the radar chart—rendered via pure SVG geometry (`<polygon>`, `<line>`, `<circle>`).
* Interactive theme switching with persistent local storage.
* Fully responsive across mobile (<640px), tablet (640px-1024px), and desktop (≥1024px).

---

### Task 1: Scaffolding, Package Setup & Design Tokens

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/index.css`
- Create: `src/context/ThemeContext.jsx`
- Create: `src/context/ToastContext.jsx`

**Interfaces:**
- Produces: `ThemeProvider`, `useTheme`, `ToastProvider`, `useToast`
- `useTheme()` returns `{ theme: 'light' | 'dark', toggleTheme: () => void }`
- `useToast()` returns `{ showToast: (message: string, type?: 'success' | 'info') => void }`

- [ ] **Step 1: Initialize Vite React application files**
Scaffold `package.json`, `vite.config.js`, and `index.html` loading Google Fonts (`Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..700` and `Plus+Jakarta+Sans:wght@400;500;600;700`).

- [ ] **Step 2: Install dependencies**
Run `npm install` to install React, React-DOM, and Vite development tooling.

- [ ] **Step 3: Implement ThemeContext and ToastContext**
Create `src/context/ThemeContext.jsx` and `src/context/ToastContext.jsx` managing dark/light modes and floating feedback notifications.

- [ ] **Step 4: Implement Base Design Tokens in `src/index.css`**
Set up `:root` and `[data-theme="dark"]` CSS variables for palette (`--primary-navy`, `--accent-teal`, `--bg-page`, `--bg-card`, `--text-main`, `--text-muted`, `--border-subtle`), typography, and reset rules.

- [ ] **Step 5: Verify initial dev server starts**
Run `npm run build` or start `npm run dev` briefly to confirm clean build.

- [ ] **Step 6: Commit**
```bash
git add package.json vite.config.js index.html src/
git commit -m "feat: scaffold React+Vite project and design token system"
```

---

### Task 2: Navbar Component with Theme Toggle & Smooth Navigation

**Files:**
- Create: `src/components/Navbar.jsx`
- Create: `src/components/Navbar.css`

**Interfaces:**
- Consumes: `useTheme()`, `useToast()`
- Produces: `<Navbar />` rendered in `App.jsx`

- [ ] **Step 1: Write Navbar layout and markup**
Include the "S" SkillBridge badge logo, links (*Opportunities*, *For Colleges*, *For Companies*, *Demo View*), Dark Mode moon/sun toggle button, and "Sign In" / "Get Started" buttons.

- [ ] **Step 2: Add Navbar styles (`Navbar.css`)**
Fixed/sticky positioning, blur backdrop, responsive mobile menu drawer, active indicator states, and button styles matching Figma.

- [ ] **Step 3: Verify toggle and button interactivity**
Test theme toggle switching between light and dark backgrounds, and test toast on "Sign In" / "Get Started".

- [ ] **Step 4: Commit**
```bash
git add src/components/Navbar.*
git commit -m "feat: add Navbar component with theme switcher"
```

---

### Task 3: Hero Section & Floating Stats Strip

**Files:**
- Create: `src/components/Hero.jsx`
- Create: `src/components/Hero.css`
- Create: `src/components/StatsStrip.jsx`
- Create: `src/components/StatsStrip.css`

**Interfaces:**
- Consumes: `useToast()`
- Produces: `<Hero />`, `<StatsStrip />`

- [ ] **Step 1: Build Hero markup with exact Figma typography**
Include:
- Pill badge: `• Academia-Industry Integration Platform`
- Main heading: `Bridge the gap ` `<span className="serif-italic-accent">between learning</span>` ` and hiring.`
- Subtitle paragraph.
- Primary CTA (`Find Internships →`) and Secondary CTA (`Post Opportunities`).

- [ ] **Step 2: Build StatsStrip markup**
4 metrics in a floating elevated card:
1. `12,500+` / `STUDENTS ASSESSED`
2. `45+` / `PARTNER UNIVERSITIES`
3. `320+` / `ACTIVE RECRUITERS`
4. `92%` / `MATCH-TO-INTERVIEW RATE`

- [ ] **Step 3: Implement Hero & StatsStrip styling**
Deep ocean navy gradient (`#0c2f55` to `#164e7e`) with subtle mesh glow, italic mint serif styles, floating card elevation with border dividers, and responsive stacking for mobile.

- [ ] **Step 4: Commit**
```bash
git add src/components/Hero.* src/components/StatsStrip.*
git commit -m "feat: add Hero section and StatsStrip component"
```

---

### Task 4: Platform Architecture ("How SkillBridge Operates")

**Files:**
- Create: `src/components/PlatformArchitecture.jsx`
- Create: `src/components/PlatformArchitecture.css`

**Interfaces:**
- Produces: `<PlatformArchitecture />`

- [ ] **Step 1: Build PlatformArchitecture component**
- Section tag: `PLATFORM ARCHITECTURE`
- Heading: `How SkillBridge Operates`
- Subtitle: `Targeted solutions for three primary stakeholders`
- 3 cards (`Students` 01 with diamond SVG, `Colleges` 02 with hexagon SVG, `Recruiters` 03 with concentric target SVG).

- [ ] **Step 2: Style cards in `PlatformArchitecture.css`**
3-column responsive grid, subtle top border highlight on hover, numbered watermark `01/02/03`, and smooth elevation.

- [ ] **Step 3: Commit**
```bash
git add src/components/PlatformArchitecture.*
git commit -m "feat: add PlatformArchitecture stakeholder cards"
```

---

### Task 5: Curated Recommendations Section

**Files:**
- Create: `src/components/CuratedMatches.jsx`
- Create: `src/components/CuratedMatches.css`
- Create: `src/data/jobMatches.js`

**Interfaces:**
- Consumes: `useToast()`
- Produces: `<CuratedMatches />`

- [ ] **Step 1: Define job data in `jobMatches.js`**
3 items matching Figma:
1. `Junior ML Engineer` (Apex Data Systems, Remote · 6 Months, 94% Match, skills: Python, PyTorch, FastAPI, SQL).
2. `Full-Stack Intern` (Novus Cloud, Hybrid · 3 Months, 87% Match, skills: React, Node.js, TypeScript, Tailwind).
3. `Cloud Associate` (Nexus Global, On-Site · 6 Months, 78% Match, skills: AWS, Docker, Linux, Git).

- [ ] **Step 2: Build card markup & layout in `CuratedMatches.jsx`**
Include location/duration badges, match percentage pill, animated progress bar, skill chips, and "Apply Now" button.

- [ ] **Step 3: Style in `CuratedMatches.css`**
Match progress bar colors, badge pills, skill chips, and button hover states. Add toast confirmation when clicking "Apply Now".

- [ ] **Step 4: Commit**
```bash
git add src/components/CuratedMatches.* src/data/jobMatches.js
git commit -m "feat: add CuratedMatches job cards with apply action"
```

---

### Task 6: Skill Gap Engine with Mathematical SVG Radar Chart

**Files:**
- Create: `src/components/SkillGapEngine.jsx`
- Create: `src/components/SkillGapEngine.css`
- Create: `src/components/RadarChart.jsx`
- Create: `src/data/radarData.js`

**Interfaces:**
- Consumes: role selection state
- Produces: `<SkillGapEngine />`, `<RadarChart />`

- [ ] **Step 1: Create 8-axis competencies dataset in `radarData.js`**
Define competencies: Cloud Platforms, Kubernetes & Orchestration, Infrastructure as Code, Linux & Networking, CI/CD Pipelines, Security & Compliance, Monitoring & Observability, Scripting & Automation with user profile scores and role benchmarks.

- [ ] **Step 2: Implement pure SVG RadarChart component (`RadarChart.jsx`)**
Trigonometric helper `getCoordinates(angle, radius, center)` calculating points for:
- 4 concentric octagonal webs
- 8 radial axis lines and positioned text labels
- Role Benchmark polygon with dashed outline
- User Profile polygon with translucent mint fill (`rgba(45, 212, 191, 0.25)`) and solid teal outline & dots
- Interactive legend (`— Your Profile`, `--- Role Benchmark`)

- [ ] **Step 3: Implement Competency Gap Bars & 74% Readiness Card**
Right column with gap indicators (`-40`, `-28`, `-20`, `-10`, etc.) and the dark navy "OVERALL READINESS 74%" card.

- [ ] **Step 4: Add role switcher interactivity**
Allow toggling between Cloud Infrastructure Engineer, ML Engineer, and Full-Stack Intern, dynamically updating the radar polygon and gap meters with smooth transition.

- [ ] **Step 5: Commit**
```bash
git add src/components/SkillGapEngine.* src/components/RadarChart.* src/data/radarData.js
git commit -m "feat: add SkillGapEngine with custom SVG radar chart"
```

---

### Task 7: Application Tracking Module

**Files:**
- Create: `src/components/ApplicationTracker.jsx`
- Create: `src/components/ApplicationTracker.css`
- Create: `src/data/applications.js`

**Interfaces:**
- Produces: `<ApplicationTracker />`

- [ ] **Step 1: Populate application pipeline records in `applications.js`**
Include:
- `Junior ML Engineer` | `Apex Data Systems` | `Aug 28, 2026` | 94% | `Interview Scheduled`
- `Full-Stack Intern` | `Novus Cloud` | `Sep 02, 2026` | 87% | `Under Review`
- `Backend Developer` | `Stratosphere Labs` | `Sep 04, 2026` | 91% | `Offer Extended`

- [ ] **Step 2: Build table and row components in `ApplicationTracker.jsx`**
Header bar styling, responsive horizontal scroll on mobile, match confidence progress bar, and status pill badges.

- [ ] **Step 3: Style table in `ApplicationTracker.css`**
Exact table border radius, subtle hover highlight, status pill colors (Amber, Blue, Green).

- [ ] **Step 4: Commit**
```bash
git add src/components/ApplicationTracker.* src/data/applications.js
git commit -m "feat: add ApplicationTracker pipeline view"
```

---

### Task 8: Call to Action Section, Footer & App Integration

**Files:**
- Create: `src/components/CTASection.jsx`
- Create: `src/components/CTASection.css`
- Create: `src/components/Footer.jsx`
- Create: `src/components/Footer.css`
- Modify: `src/App.jsx`
- Modify: `src/App.css`

**Interfaces:**
- Assembles all components into the full page view.

- [ ] **Step 1: Build CTASection component**
Tag `READY TO CONNECT`, headline *Your next placement starts here.* (with italic serif highlight), subtext, and twin buttons (`Student Sign Up`, `University Portal`).

- [ ] **Step 2: Build Footer component**
Dark navy styling, copyright notice `© 2026 SkillBridge - Built for Academia Industry Integration & Placement Automation`.

- [ ] **Step 3: Assemble everything in `src/App.jsx`**
Mount `Navbar`, `Hero`, `StatsStrip`, `PlatformArchitecture`, `CuratedMatches`, `SkillGapEngine`, `ApplicationTracker`, `CTASection`, `Footer` wrapped in `ThemeProvider` and `ToastProvider`.

- [ ] **Step 4: Commit**
```bash
git add src/components/CTASection.* src/components/Footer.* src/App.*
git commit -m "feat: assemble full SkillBridge landing page"
```

---

### Task 9: Verification & Visual Polish

**Files:**
- Review: all components and CSS

- [ ] **Step 1: Build check**
Run `npm run build` to verify clean build without warnings or syntax errors.

- [ ] **Step 2: Browser Subagent Verification**
Launch dev server with `npm run dev` and use the browser subagent to visually inspect the rendered page against the Figma screenshots (Hero, Stats, Architecture, Curated Matches, Radar Chart, Tracking Table, CTA, Footer, and theme toggle).

- [ ] **Step 3: Final Commit**
```bash
git commit -am "chore: polish responsiveness and finish Figma implementation"
```
