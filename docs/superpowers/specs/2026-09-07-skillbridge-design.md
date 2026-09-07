# SkillBridge Frontend Design Specification

## 1. System Overview
SkillBridge is an Academia-Industry Integration Platform connecting students, partner universities, and enterprise recruiters. This specification defines the frontend implementation for the landing page and interactive platform preview based on the Figma designs.

The frontend is built using **React + Vite**, utilizing **Vanilla CSS** with a comprehensive design token architecture for maximum performance, maintainability, and pixel-perfect fidelity.

---

## 2. Visual Design System

### 2.1 Typography
* **Headings**: Editorial Serif (`Playfair Display` / `Newsreader` via Google Fonts).
* **Accent Serif**: Italic serif for hero catchphrase highlights (*"between learning"*, *"starts here."*).
* **Body / UI**: Clean geometric sans-serif (`Plus Jakarta Sans` / `Inter`).
* **Tags & Badges**: Monospace or clean uppercase sans with letter-spacing (`letter-spacing: 0.08em`).

### 2.2 Color Tokens
* **Primary Deep Navy**: `#0c2f55` (hero gradient start, primary action buttons, section headlines).
* **Deep Navy Secondary**: `#164e7e` (hero gradient bottom).
* **Mint / Teal Accent**: `#2dd4bf` (primary highlights, progress bars, radar polygon fill/stroke, match badges).
* **Neutral Background Light**: `#f8fafc` (page background).
* **Card Surface Light**: `#ffffff` (border: `1px solid #e2e8f0`, shadow: `0 4px 20px -2px rgba(12, 47, 85, 0.06)`).
* **Text Main**: `#0f172a` (light mode), `#f1f5f9` (dark mode).
* **Text Muted**: `#64748b` (light mode), `#94a3b8` (dark mode).
* **Status Badges**:
  * `Interview Scheduled`: Background `#fef3c7`, text `#b45309`, border `#fde68a`.
  * `Under Review`: Background `#e0f2fe`, text `#0369a1`, border `#bae6fd`.
  * `Offer Extended`: Background `#dcfce7`, text `#15803d`, border `#bbf7d0`.

### 2.3 Dark / Light Mode
* Implemented via `data-theme="light"` and `data-theme="dark"` on `document.documentElement`.
* Toggleable via the moon/sun icon in the navbar.
* Persisted in `localStorage`.

---

## 3. Component Hierarchy & Layout

```text
App
├── ToastContainer (Global feedback notifications)
├── Navbar (Sticky header, brand, navigation, theme toggle, CTAs)
├── Hero (Gradient background, badge, dual-style typography, twin CTAs)
├── StatsStrip (4 metrics: 12,500+, 45+, 320+, 92%)
├── PlatformArchitecture (3 numbered stakeholder cards: Students, Colleges, Recruiters)
├── CuratedMatches (Filterable job match cards: Junior ML, Full-Stack, Cloud Associate)
├── SkillGapEngine (Role switcher, SVG Radar/Spider Chart, Competency Gaps, 74% Readiness)
├── ApplicationTracker (Live pipeline status table with status badges & progress bars)
├── CTASection (Conversion banner: Student Sign Up, University Portal)
└── Footer (Branded copyright & links)
```

---

## 4. Component Details

### 4.1 Navbar (`Navbar.jsx`)
* Left: Branded icon square with "S" logo and "SkillBridge" wordmark.
* Center: Navigation links (*Opportunities*, *For Colleges*, *For Companies*, *Demo View*) with smooth scroll anchors.
* Right:
  * Theme toggle button (moon/sun).
  * Outline "Sign In" button.
  * Solid navy "Get Started" button.

### 4.2 Hero Section (`Hero.jsx`)
* Deep navy atmospheric gradient background.
* Top pill badge: `• Academia-Industry Integration Platform`.
* Title: *"Bridge the gap between learning and hiring."* with *"between learning"* styled in mint italic serif.
* Subtitle describing placement analytics and skill mapping.
* Buttons:
  * Primary: "Find Internships →" (mint-teal background).
  * Secondary: "Post Opportunities" (subtle ghost button with border).

### 4.3 Stats Strip (`StatsStrip.jsx`)
* Elevated card spanning across the hero bottom boundary.
* 4 stat blocks divided by subtle vertical borders:
  1. `12,500+` / `STUDENTS ASSESSED`
  2. `45+` / `PARTNER UNIVERSITIES`
  3. `320+` / `ACTIVE RECRUITERS`
  4. `92%` / `MATCH-TO-INTERVIEW RATE`

### 4.4 Platform Architecture (`PlatformArchitecture.jsx`)
* Tag: `PLATFORM ARCHITECTURE`
* Title: `How SkillBridge Operates`
* Subtitle: `Targeted solutions for three primary stakeholders`
* 3 cards with step numbers `01`, `02`, `03` and custom geometric SVG icons:
  * **Students**: Skill assessments and targeted profile discovery.
  * **Colleges**: Real-time departmental placement readiness tracking.
  * **Recruiters**: Algorithmic metric-based matching without resume filtering fatigue.

### 4.5 Curated Recommendations (`CuratedMatches.jsx`)
* Tag: `CURATED MATCHES`
* Title: `Curated Recommendations`
* Subtitle: `Automated candidate matching via mapped technical profiles`
* 3 interactive job cards:
  * `Junior ML Engineer` (Apex Data Systems, Remote · 6 Months, 94% Match, skills: Python, PyTorch, FastAPI, SQL).
  * `Full-Stack Intern` (Novus Cloud, Hybrid · 3 Months, 87% Match, skills: React, Node.js, TypeScript, Tailwind).
  * `Cloud Associate` (Nexus Global, On-Site · 6 Months, 78% Match, skills: AWS, Docker, Linux, Git).
* Each card includes an "Apply Now" button triggering dynamic toast confirmation.

### 4.6 Skill Gap Engine (`SkillGapEngine.jsx`)
* Tag: `SKILL GAP ENGINE`
* Role selector header allowing switching between:
  * `Cloud Infrastructure Engineer` (default)
  * `Machine Learning Engineer`
  * `Full-Stack Developer`
* Subtitle: `Comparing your current proficiency against role benchmarks across 8 core competencies`
* **Custom SVG Radar Chart**:
  * 8 radial axes:
    1. Cloud Platforms (AWS/GCP/Azure)
    2. Kubernetes & Orchestration
    3. Infrastructure as Code
    4. Linux & Networking
    5. CI/CD Pipelines
    6. Security & Compliance
    7. Monitoring & Observability
    8. Scripting & Automation
  * Mathematical SVG rendering with polygon calculation based on center coordinates `(cx, cy)` and radius `r`.
  * Multi-level concentric octagonal guide webs.
  * Translucent mint polygon fill (`rgba(45, 212, 191, 0.25)`) with teal points.
  * Dashed stroke polygon for Role Benchmark.
  * Bottom legend: `— Your Profile`, `--- Role Benchmark`.
* **Right Panel**:
  * Competency Gaps: Horizontal bars with gap labels (`-40`, `-28`, `-20`, `-10`, etc.).
  * Overall Readiness Box: Dark navy card displaying `74%` readiness.

### 4.7 Application Tracking Module (`ApplicationTracker.jsx`)
* Tag: `PIPELINE VIEW`
* Title: `Application Tracking Module`
* Subtitle: `Real-time lifecycle pipeline for candidates and placement offices`
* Responsive data table:
  * Columns: `ROLE`, `COMPANY`, `DATE SUBMITTED`, `MATCH CONFIDENCE`, `STATUS`.
  * Rows:
    * `Junior ML Engineer` | `Apex Data Systems` | `Aug 28, 2026` | 94% | `Interview Scheduled`
    * `Full-Stack Intern` | `Novus Cloud` | `Sep 02, 2026` | 87% | `Under Review`
    * `Backend Developer` | `Stratosphere Labs` | `Sep 04, 2026` | 91% | `Offer Extended`

### 4.8 Ready to Connect CTA & Footer (`CTASection.jsx`, `Footer.jsx`)
* CTA Box:
  * Tag: `READY TO CONNECT`
  * Title: *Your next placement starts here.* (*"starts here."* in serif italic).
  * Subtitle: *Join 12,500 assessed students and 45+ partner universities already on the platform.*
  * Buttons: `Student Sign Up` (navy filled), `University Portal` (bordered).
* Footer:
  * Deep midnight navy background `#0a233f`.
  * Text: `© 2026 SkillBridge - Built for Academia Industry Integration & Placement Automation`.

---

## 5. Responsiveness & Accessibility
* Responsive breakpoint layout (Mobile `< 640px`, Tablet `< 1024px`, Desktop `≥ 1024px`).
* Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<table>`, `<footer>`).
* Proper ARIA labels on icon buttons and toggles.
