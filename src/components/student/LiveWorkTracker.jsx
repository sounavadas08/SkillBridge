import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Clock, 
  ChevronRight, 
  ExternalLink, 
  Building2, 
  AlertCircle,
  FileCode2,
  Calendar,
  CheckCircle2,
  PlayCircle,
  Layers,
  Sparkles
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

// Target start dates for upcoming cohorts
const UPCOMING_COHORTS = [
  {
    id: 'up-1',
    role: 'Accelerated Computing & CUDA Co-op',
    company: 'NVIDIA',
    location: 'Santa Clara, CA (Hybrid)',
    stipend: '$56/hr • $9,520/mo',
    // Target: 2 days, 14 hours, 38 mins from now
    targetDateOffsetMs: (2 * 24 * 3600 + 14 * 3600 + 38 * 60) * 1000,
    startDateStr: 'Mon, Sep 14, 2026 • 09:00 AM',
    checklist: ['NDA Executed', 'CUDA 12.4 Setup', 'GPU Cluster Access'],
    completedTasks: 2,
    totalTasks: 3,
    mentor: 'Dr. Jesse Lin (Principal Architect)',
    prerequisites: 'C++, CUDA Kernels, TensorRT'
  },
  {
    id: 'up-2',
    role: 'Applied AI & Transformers Fellowship',
    company: 'Microsoft',
    location: 'Redmond, WA (Remote)',
    stipend: '$52/hr • $8,840/mo',
    // Target: 5 days, 8 hours, 15 mins from now
    targetDateOffsetMs: (5 * 24 * 3600 + 8 * 3600 + 15 * 60) * 1000,
    startDateStr: 'Thu, Sep 17, 2026 • 10:00 AM',
    checklist: ['Azure Tenant Access', 'PyTorch 2.4 Setup', 'Security Clearance'],
    completedTasks: 1,
    totalTasks: 3,
    mentor: 'Kavita Rao (Staff AI Lead)',
    prerequisites: 'PyTorch, Transformers, ONNX'
  },
  {
    id: 'up-3',
    role: 'Cloud Infrastructure & DevOps Accelerator',
    company: 'Amazon Web Services',
    location: 'Seattle, WA (Hybrid)',
    stipend: '$54/hr • $9,180/mo',
    // Target: 9 days, 21 hours, 5 mins from now
    targetDateOffsetMs: (9 * 24 * 3600 + 21 * 3600 + 5 * 60) * 1000,
    startDateStr: 'Mon, Sep 21, 2026 • 08:30 AM',
    checklist: ['IAM Role Configuration', 'Kubernetes Lab Access', 'Orientation Call'],
    completedTasks: 1,
    totalTasks: 3,
    mentor: 'Marcus Brody (VP Infrastructure)',
    prerequisites: 'AWS, Kubernetes, Terraform, Go'
  }
];

// Active ongoing works running right now
const ACTIVE_ONGOING_WORKS = [
  {
    id: 'act-1',
    role: 'High-Performance Virtualized Table Component',
    company: 'Stripe Ecosystem',
    type: 'Micro-Internship Sprint',
    status: 'In Progress • Day 2 of 3',
    progress: 68,
    timeRemaining: '26h 44m remaining in sprint',
    mentor: 'Dr. Aris Vance (Lead Architect)',
    stipend: '$750 USD Bounty',
    nextMilestone: '60fps Virtual Scrolling Benchmark',
    workspaceUrl: 'https://github.com/skillbridge/virtual-table-spec'
  },
  {
    id: 'act-2',
    role: 'Distributed State Sync & Consensus Fellowship',
    company: 'Google Summer of Code',
    type: 'Corporate Academic Co-op',
    status: 'Active Cohort • Week 4 of 12',
    progress: 35,
    timeRemaining: 'Next Sprint Milestone due in 4d 11h',
    mentor: 'Sarah Zhang (Staff Infrastructure Engineer)',
    stipend: '$58/hr • $9,850/mo',
    nextMilestone: 'Raft State Machine Log Replication Test Suite',
    workspaceUrl: 'https://github.com/skillbridge/raft-consensus-coop'
  }
];

export function LiveWorkTracker({ onNavigateSection }) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'active'
  const [baseTime] = useState(() => Date.now());
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [selectedWork, setSelectedWork] = useState(null);

  // Live 1-second countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Compute countdown string for an upcoming item
  const getCountdown = (offsetMs) => {
    const elapsed = currentTime - baseTime;
    const remainingMs = Math.max(0, offsetMs - elapsed);

    const totalSeconds = Math.floor(remainingMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      isExpired: remainingMs <= 0
    };
  };

  const handleAction = (item, actionName) => {
    showToast(`${actionName} opened for ${item.role} at ${item.company}!`, 'success');
  };

  return (
    <div className="border border-border/80 bg-card rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Briefcase size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Live Work & Internship Tracker
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Live Sync
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time monitor of active engagements running now and upcoming cohorts with countdown clocks.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Toggle: Strictly Crimson / Amber Theme */}
        <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border shrink-0">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'upcoming'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock size={14} />
            Starting Soon
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
              activeTab === 'upcoming' ? 'bg-black/20 text-white' : 'bg-muted text-foreground'
            }`}>
              {UPCOMING_COHORTS.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'active'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <PlayCircle size={14} />
            Running Now
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
              activeTab === 'active' ? 'bg-black/20 text-white' : 'bg-muted text-foreground'
            }`}>
              {ACTIVE_ONGOING_WORKS.length}
            </span>
          </button>
        </div>
      </div>

      {/* Top 3 Summary Metrics: Crimson & Amber Palette Only */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Active Works Running Now
            </span>
            <div className="text-2xl font-mono font-extrabold text-foreground mt-0.5 flex items-center gap-2">
              {ACTIVE_ONGOING_WORKS.length} Engagements
              <span className="size-2 rounded-full bg-primary animate-ping" />
            </div>
            <span className="text-[11px] text-muted-foreground">In active sprint delivery</span>
          </div>
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <PlayCircle size={22} />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Cohorts Starting Soon
            </span>
            <div className="text-2xl font-mono font-extrabold text-amber-500 mt-0.5">
              {UPCOMING_COHORTS.length} Cohorts
            </div>
            <span className="text-[11px] text-muted-foreground">With live countdown timers</span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock size={22} />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Verified Proof-of-Works
            </span>
            <div className="text-2xl font-mono font-extrabold text-foreground mt-0.5">
              4 Completed
            </div>
            <span className="text-[11px] text-muted-foreground">Academic stamped bounties</span>
          </div>
          <div className="p-2.5 rounded-lg bg-muted text-foreground border border-border">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: STARTING SOON WITH LIVE COUNTDOWN TIMERS */}
      {/* ========================================================================= */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              Upcoming Cohorts with Real-Time Countdown Clocks
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              Live updates every second
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {UPCOMING_COHORTS.map((cohort) => {
              const cd = getCountdown(cohort.targetDateOffsetMs);

              return (
                <div
                  key={cohort.id}
                  className="p-5 rounded-2xl border border-border hover:border-amber-500/50 bg-card flex flex-col justify-between space-y-5 transition-all shadow-xs group"
                >
                  <div className="space-y-3">
                    {/* Company & Role */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                        {cohort.company}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {cohort.location}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {cohort.role}
                    </h4>

                    {/* LIVE COUNTDOWN TIMER WIDGET (Crimson & Amber Style) */}
                    <div className="p-3.5 rounded-xl bg-background/90 border border-amber-500/30 space-y-1.5 shadow-inner">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-amber-500 font-bold">
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="animate-pulse" /> Time Until Start
                        </span>
                        <span className="text-muted-foreground">Countdown</span>
                      </div>

                      {/* Digit Blocks */}
                      <div className="grid grid-cols-4 gap-1.5 text-center pt-0.5">
                        <div className="p-1.5 rounded-lg bg-card border border-border">
                          <span className="block font-mono font-extrabold text-lg text-foreground leading-none">
                            {cd.days}
                          </span>
                          <span className="text-[9px] font-mono uppercase text-muted-foreground">Days</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-card border border-border">
                          <span className="block font-mono font-extrabold text-lg text-foreground leading-none">
                            {cd.hours}
                          </span>
                          <span className="text-[9px] font-mono uppercase text-muted-foreground">Hours</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-card border border-border">
                          <span className="block font-mono font-extrabold text-lg text-foreground leading-none">
                            {cd.minutes}
                          </span>
                          <span className="text-[9px] font-mono uppercase text-muted-foreground">Mins</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-card border border-amber-500/40 bg-amber-500/5">
                          <span className="block font-mono font-extrabold text-lg text-amber-500 leading-none">
                            {cd.seconds}
                          </span>
                          <span className="text-[9px] font-mono uppercase text-amber-500/80">Secs</span>
                        </div>
                      </div>
                    </div>

                    {/* Stipend & Launch Date */}
                    <div className="space-y-1.5 text-xs pt-1">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Cohort Start:</span>
                        <span className="font-semibold text-foreground">{cohort.startDateStr}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Compensation:</span>
                        <span className="font-mono font-bold text-amber-500">{cohort.stipend}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Mentor:</span>
                        <span className="text-foreground">{cohort.mentor}</span>
                      </div>
                    </div>

                    {/* Onboarding Checklist Status */}
                    <div className="pt-2 border-t border-border/70">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground text-[11px] font-medium">Onboarding Prep:</span>
                        <span className="font-mono text-xs font-bold text-foreground">
                          {cohort.completedTasks}/{cohort.totalTasks} Done
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-amber-500 rounded-full transition-all duration-300"
                          style={{ width: `${(cohort.completedTasks / cohort.totalTasks) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleAction(cohort, 'Onboarding Kit')}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold btn-3d-liquid flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      Prepare Workspace & Onboarding <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: ACTIVE ONGOING WORKS (GOING RIGHT NOW) */}
      {/* ========================================================================= */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <PlayCircle size={16} className="text-primary" />
              Active Engagements in Delivery Right Now
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              2 Running Sprints
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {ACTIVE_ONGOING_WORKS.map((work) => (
              <div
                key={work.id}
                className="p-6 rounded-2xl border border-primary/30 bg-card flex flex-col justify-between space-y-5 shadow-sm relative overflow-hidden"
              >
                {/* Subtle top indicator bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-amber-500" />

                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                        {work.company}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase">
                        {work.type}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-500">
                      <span className="size-2 rounded-full bg-amber-500 animate-ping" />
                      {work.status}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-foreground leading-snug">
                    {work.role}
                  </h4>

                  {/* Sprint Progress */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Sprint Completion:</span>
                      <span className="font-mono font-bold text-foreground">{work.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${work.progress}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-amber-500/90 font-medium block">
                      ⏳ {work.timeRemaining}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="p-3 rounded-xl bg-background/80 border border-border space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Lead Mentor:</span>
                      <span className="font-medium text-foreground">{work.mentor}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Stipend Award:</span>
                      <span className="font-mono font-bold text-primary">{work.stipend}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Current Milestone:</span>
                      <span className="font-medium text-foreground truncate max-w-[240px]">{work.nextMilestone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <a
                    href={work.workspaceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold btn-3d-liquid flex items-center justify-center gap-1.5 text-center"
                  >
                    Open Workspace Repository <ExternalLink size={13} />
                  </a>

                  <button
                    onClick={() => handleAction(work, 'Milestone Submission')}
                    className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors shrink-0"
                  >
                    Submit Milestone
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
