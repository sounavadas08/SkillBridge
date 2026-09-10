import React from 'react';
import { Check, ArrowUpRight, Sparkles, Briefcase, Calendar, Search, ShieldCheck } from 'lucide-react';

const RECENT_FEED_ITEMS = [
  {
    id: 1,
    type: 'match',
    candidate: 'Alex Chen',
    school: 'Stanford University • Computer Science',
    matchScore: 96,
    role: 'Senior React / UI Architect',
    time: '12m ago',
    verified: true
  },
  {
    id: 2,
    type: 'challenge',
    candidate: 'Sarah Jenkins',
    school: 'MIT • Electrical Eng & CS',
    matchScore: 92,
    role: 'Full-Stack Node/PostgreSQL Challenge',
    time: '1h ago',
    verified: true
  },
  {
    id: 3,
    type: 'interview',
    candidate: 'Marcus Vance',
    school: 'UC Berkeley • Software Eng',
    matchScore: 89,
    role: 'Frontend Performance Engineer',
    time: '3h ago',
    verified: true
  }
];

export function RecruiterDashboardView({ onNavigateSection }) {
  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="space-y-6 pt-2">
        <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-muted-foreground">
          <span className="rp-seal"><Check size={12} /></span>
          <span>Verified Academic Talent Platform</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 space-y-4">
            <h1 className="rp-display-xl">
              Ending resume noise with verified, evidence-based hiring.
            </h1>
            <p className="rp-body-l text-muted-foreground">
              Rank candidates by true skill alignment via semantic vector embeddings, evaluate real-world micro-internship submissions, and schedule interviews seamlessly.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-3 justify-end">
            <button
              onClick={() => onNavigateSection('radar')}
              className="rp-button-primary justify-center text-base py-4"
            >
              <Sparkles size={18} /> Launch AI Talent Radar
            </button>
            <button
              onClick={() => onNavigateSection('challenges')}
              className="rp-button-secondary justify-center text-sm"
            >
              <Briefcase size={16} /> Post Micro-Internship Task
            </button>
          </div>
        </div>
      </section>

      <hr className="rp-hairline" />

      {/* Metric Transcript Strip */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rp-card space-y-2">
          <span className="rp-meta">Active Vector Searches</span>
          <p className="text-3xl font-extrabold font-mono tracking-tight text-foreground">14</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">↑ 96% semantic accuracy rating</p>
        </div>

        <div className="rp-card space-y-2">
          <span className="rp-meta">Verified Submissions</span>
          <p className="text-3xl font-extrabold font-mono tracking-tight text-foreground">28</p>
          <p className="text-xs text-muted-foreground font-medium">8 pending recruiter review</p>
        </div>

        <div className="rp-card space-y-2">
          <span className="rp-meta">Confirmed Interviews</span>
          <p className="text-3xl font-extrabold font-mono tracking-tight text-foreground">9</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">0 calendar conflicts</p>
        </div>
      </section>

      <hr className="rp-hairline" />

      {/* Live Transcript Activity Feed */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="rp-heading">Recruiter Dossier Feed</h2>
            <p className="rp-meta mt-1">Real-time candidate matches, challenge submissions, and confirmed interviews</p>
          </div>

          <button
            onClick={() => onNavigateSection('radar')}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View All Candidates <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="border border-border rounded-xl bg-card overflow-hidden divide-y divide-border shadow-sm">
          {RECENT_FEED_ITEMS.map((item) => (
            <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-start gap-3.5">
                <span className="rp-seal mt-0.5"><Check size={13} /></span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-foreground">{item.candidate}</h3>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {item.matchScore}% Match
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.school}</p>
                  <p className="text-xs font-medium text-foreground mt-1">Targeting: {item.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="rp-meta">{item.time}</span>
                <button
                  onClick={() => onNavigateSection(item.type === 'scheduler' ? 'scheduler' : 'radar')}
                  className="rp-button-secondary py-2 text-xs"
                >
                  Inspect Candidate Dossier
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
