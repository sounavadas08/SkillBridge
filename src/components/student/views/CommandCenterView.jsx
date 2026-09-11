import React from 'react';
import { ArrowUpRight, TrendingUp, Briefcase, FileText, Code2, AlertCircle } from 'lucide-react';
import { LiveWorkTracker } from '../LiveWorkTracker';

export function CommandCenterView({ onNavigateSection, user }) {
  const userName = user?.name || user?.email?.split('@')[0] || 'Alex Chen';
  
  return (
    <div 
      className="flex flex-col gap-8 pb-12 transition-all duration-300"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Career Command Center</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {userName}. Here is where you stand today.</p>
        </div>
        <div className="flex items-center gap-3 bg-card px-4 py-2 border border-border rounded-lg shadow-sm">
          <div className="size-2 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium font-mono text-amber-500">Readiness Score: 85%</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-card border border-border p-6 rounded-xl flex flex-col items-center text-center shadow-sm">
          <div className="size-24 rounded-full bg-muted border-2 border-primary overflow-hidden mb-4 shadow-md">
            <img 
              src={user?.avatar || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop&auto=format"} 
              alt="Student Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-xl font-medium">{userName}</h2>
          <p className="text-muted-foreground text-sm mb-4">
            {user?.department || 'B.S. Computer Science'} • {user?.grad_year || 'Class of 2025'}
          </p>
          <div className="w-full bg-muted rounded-full h-2 mb-2">
            <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: '85%' }} />
          </div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
            Target: {user?.targetRole || 'Cloud Infrastructure'}
          </span>
        </div>

        {/* Status Grid */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatusCard 
            title="Skill Gaps"
            value="3"
            subtitle="Identified in TypeScript & GraphQL"
            icon={<AlertCircle className="text-amber-500" size={20} />}
            trend="Needs Attention"
            onClick={() => onNavigateSection && onNavigateSection('radar')}
          />
          <StatusCard 
            title="Matched Jobs"
            value="12"
            subtitle="Top tier tech opportunities"
            icon={<Briefcase className="text-primary" size={20} />}
            trend="+4 this week"
            onClick={() => onNavigateSection && onNavigateSection('opportunities')}
          />
          <StatusCard 
            title="Resume Status"
            value="Strong"
            subtitle="Verified ATS rating: 92%"
            icon={<FileText className="text-amber-500" size={20} />}
            trend="Ready for apply"
            onClick={() => onNavigateSection && onNavigateSection('resume')}
          />
          <StatusCard 
            title="Micro-Internships"
            value="4 Active"
            subtitle="Corporate tasks & bounties"
            icon={<Code2 className="text-primary" size={20} />}
            trend="Open Bounties"
            onClick={() => onNavigateSection && onNavigateSection('challenges')}
          />
        </div>
      </div>

      {/* Live Work & Upcoming Internship Tracker Section */}
      <LiveWorkTracker onNavigateSection={onNavigateSection} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="border border-border bg-card p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg">Next Steps: Upskilling</h3>
            <button 
              onClick={() => onNavigateSection && onNavigateSection('radar')}
              className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
            >
              View Pathway <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Advanced TypeScript Types', source: 'Frontend Masters', progress: 40 },
              { title: 'GraphQL API Design', source: 'Coursera', progress: 15 },
            ].map((course) => (
              <div key={course.title} className="bg-muted p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">{course.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{course.source}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-medium">{course.progress}%</span>
                  <div className="w-20 bg-background rounded-full h-1.5 mt-1 border border-border/50">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border border-border bg-card p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg">Industry Trends (2025-2027)</h3>
            <button 
              onClick={() => onNavigateSection && onNavigateSection('trends')}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <TrendingUp size={20} />
            </button>
          </div>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="size-2 bg-green-500 rounded-full mt-2 shrink-0" />
              <div>
                <p className="text-sm font-medium">React Server Components becoming standard</p>
                <p className="text-xs text-muted-foreground mt-1">High demand for Next.js and Remix experience. Matches your current trajectory.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="size-2 bg-amber-500 rounded-full mt-2 shrink-0" />
              <div>
                <p className="text-sm font-medium">WebAssembly Adoption</p>
                <p className="text-xs text-muted-foreground mt-1">Emerging skill. Consider adding Rust to your long-term learning path.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, value, subtitle, icon, trend, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="bg-card border border-border p-5 rounded-xl flex flex-col justify-between cursor-pointer group shadow-sm hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors">{title}</h3>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-semibold mb-1 tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>
        <div className="inline-flex items-center text-xs font-mono px-2 py-1 bg-muted rounded-md text-foreground">
          {trend}
        </div>
      </div>
    </div>
  );
}
