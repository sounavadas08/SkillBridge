# SkillBridge

> Academia-Industry Integration Platform bridging the gap between learning and hiring.

SkillBridge unites students, partner universities, and enterprise recruiters on one platform with skill mapping, intelligent matchmaking, and real-time placement analytics.

---

## Features

- **Hero & Landing Section:** Editorial serif typography with italic mint accent, atmospheric navy background, and instant CTA navigation.
- **Platform Architecture:** Interactive 3-stakeholder layout for Students, Colleges, and Recruiters with geometric outline icons.
- **Curated Recommendations:** Candidate job matching cards with skill tags, match confidence meters, and interactive "Apply Now" toasts.
- **Skill Gap Engine & Radar Chart:** Pure mathematical SVG 8-axis Radar (Spider) Chart comparing user profile vs. role benchmarks, live role switcher (`Cloud Infrastructure`, `ML Engineer`, `Full-Stack`), competency gap meters, and 74% overall readiness card.
- **Application Tracking Module:** Real-time lifecycle pipeline table displaying roles, companies, dates, confidence bars, and status tags (`Interview Scheduled`, `Under Review`, `Offer Extended`).
- **Dark & Light Mode:** Dual theme support toggled via the moon/sun icon in the navbar, persisting in `localStorage`.

---

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Vanilla CSS design tokens & CSS custom properties
- **Visualization:** Pure SVG geometry (zero third-party chart dependencies)
- **Typography:** Playfair Display / Newsreader & Plus Jakarta Sans via Google Fonts

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/sounavadas08/SkillBridge.git
cd SkillBridge

# Install dependencies
npm install

# Start local development server
npm run dev
```

The application will be accessible at `http://localhost:5173/`.

### Building for Production

```bash
npm run build
```
