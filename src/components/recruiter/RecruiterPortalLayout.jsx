import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Briefcase, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  Home, 
  LogOut, 
  Check,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { RecruiterDashboardView } from './views/RecruiterDashboardView';
import { TalentMatchRadarView } from './views/TalentMatchRadarView';
import { ChallengeHubView } from './views/ChallengeHubView';
import { InterviewSchedulerView } from './views/InterviewSchedulerView';
import './RecruiterPortal.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Recruiter Home', icon: LayoutDashboard },
  { id: 'radar', label: 'AI Talent Match Radar', icon: Sparkles },
  { id: 'challenges', label: 'Micro-Internship Hub', icon: Briefcase },
  { id: 'scheduler', label: 'Interview Scheduler', icon: Calendar },
];

export function RecruiterPortalLayout({ user, onLogout, onExploreHome }) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { theme, toggleTheme } = useTheme();

  return (
    <div 
      className="recruiter-portal-container flex h-screen w-full overflow-hidden"
      data-theme={theme}
    >
      {/* Left Sidebar Navigation */}
      <aside
        style={{ width: collapsed ? '76px' : '280px' }}
        className="flex flex-col border-r border-[var(--rp-hairline)] bg-[var(--rp-surface)] relative shrink-0 transition-all duration-300 z-20"
      >
        <div className="h-16 flex items-center px-4 border-b border-[var(--rp-hairline)] shrink-0 justify-between">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="size-8 rounded-lg overflow-hidden shrink-0 shadow-xs border border-primary/20">
              <img 
                src={theme === 'dark' ? '/logo-icon-dark.png' : '/logo-icon-light.png'} 
                alt="SkillBridge" 
                className="w-full h-full object-cover" 
              />
            </div>
            {!collapsed && (
              <span className="font-bold text-lg tracking-tight whitespace-nowrap text-[var(--rp-ink)] font-['Fraunces']">
                Recruiter Portal
              </span>
            )}
          </div>
        </div>

        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 bg-[var(--rp-surface)] border border-[var(--rp-hairline)] rounded-full p-1 text-[var(--rp-muted)] hover:text-[var(--rp-orange)] z-30 shadow-md transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`rp-nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={20} className="shrink-0" />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 mt-auto border-t border-[var(--rp-hairline)] shrink-0 flex flex-col gap-2 bg-[var(--rp-surface)]">
          <button 
            onClick={onExploreHome}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[var(--rp-muted)] hover:bg-[var(--rp-bg)] hover:text-[var(--rp-ink)] text-sm font-medium ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? "Explore Landing Page" : undefined}
          >
            <Home size={18} className="shrink-0" />
            {!collapsed && <span>Landing Page</span>}
          </button>

          <button 
            onClick={toggleTheme}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[var(--rp-muted)] hover:bg-[var(--rp-bg)] hover:text-[var(--rp-ink)] text-sm font-medium ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? `Theme (${theme})` : undefined}
          >
            {theme === 'dark' ? <Sun size={18} className="shrink-0 text-amber-400" /> : <Moon size={18} className="shrink-0" />}
            {!collapsed && <span>Theme ({theme})</span>}
          </button>

          {onLogout && (
            <button 
              onClick={onLogout}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-red-500 hover:bg-red-500/10 text-sm font-medium ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? "Sign Out" : undefined}
            >
              <LogOut size={18} className="shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[var(--rp-bg)] p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <RecruiterDashboardView onNavigateSection={(tab) => setActiveTab(tab)} />}
          {activeTab === 'radar' && <TalentMatchRadarView />}
          {activeTab === 'challenges' && <ChallengeHubView />}
          {activeTab === 'scheduler' && <InterviewSchedulerView />}
        </div>
      </main>
    </div>
  );
}
