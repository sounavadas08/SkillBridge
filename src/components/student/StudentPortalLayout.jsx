import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  UserCircle2, 
  FileText, 
  Briefcase, 
  Radar,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  GraduationCap,
  TrendingUp,
  MessageSquareText,
  Moon,
  Sun,
  Home,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { CommandCenterView } from './views/CommandCenterView';
import { SkillVaultView } from './views/SkillVaultView';
import { SkillRadarView } from './views/SkillRadarView';
import { AiResumeView } from './views/AiResumeView';
import { OpportunitiesView } from './views/OpportunitiesView';
import { MockInterviewsView } from './views/MockInterviewsView';
import { IndustryTrendsView } from './views/IndustryTrendsView';
import { AiMentorView } from './views/AiMentorView';
import { AiMentorDrawer } from './AiMentorDrawer';
import './StudentPortal.css';

const NAV_ITEMS = [
  { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
  { id: 'ai-mentor', label: 'AI Mentor Studio', icon: Sparkles },
  { id: 'skillvault', label: 'SkillVault', icon: UserCircle2 },
  { id: 'radar', label: 'Skill-Gap Radar', icon: Radar },
  { id: 'resume', label: 'AI Resume Architect', icon: FileText },
  { id: 'opportunities', label: 'Opportunity Matcher', icon: Briefcase },
  { id: 'mock-interviews', label: 'Mock Interviews', icon: BrainCircuit },
  { id: 'trends', label: 'Industry Trends', icon: TrendingUp },
];

export function StudentPortalLayout({ user, onLogout, onExploreHome, onUpdateUser }) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('command-center');
  const [showMentorDrawer, setShowMentorDrawer] = useState(false);

  const { theme, toggleTheme } = useTheme();

  return (
    <div className="student-portal-container flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar Navigation */}
      <aside 
        style={{ width: collapsed ? '76px' : '270px' }}
        className="student-sidebar flex flex-col border-r border-border bg-card relative shrink-0 transition-all duration-300 z-20"
      >
        <div className="h-16 flex items-center px-4 border-b border-border shrink-0 justify-between">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => setActiveTab('command-center')}>
            <GraduationCap className="size-8 text-primary shrink-0" />
            {!collapsed && (
              <span className="font-semibold text-lg tracking-tight whitespace-nowrap">
                Student Portal
              </span>
            )}
          </div>
        </div>

        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 bg-card border border-border rounded-full p-1 text-muted-foreground hover:text-primary z-30 shadow-md transition-colors"
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
                className={`student-nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={20} className="shrink-0" />
                {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions: Home, Theme Toggle & AI Mentor */}
        <div className="p-3 mt-auto border-t border-border shrink-0 flex flex-col gap-2 bg-card">
          <button 
            onClick={onExploreHome}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground text-sm font-medium ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? "Explore Landing Page" : undefined}
          >
            <Home size={18} className="shrink-0" />
            {!collapsed && <span>Landing Page</span>}
          </button>

          <button 
            onClick={toggleTheme}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground text-sm font-medium ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? `Theme (${theme})` : undefined}
          >
            {theme === 'dark' ? <Sun size={18} className="shrink-0 text-amber-400" /> : <Moon size={18} className="shrink-0" />}
            {!collapsed && <span>Theme ({theme})</span>}
          </button>

          <button 
            onClick={() => setShowMentorDrawer(true)}
            className={`flex items-center justify-center gap-2 bg-primary text-primary-foreground p-2.5 rounded-lg w-full hover:bg-primary/90 transition-colors shadow-sm ${collapsed ? 'px-0' : 'px-3'}`}
            title={collapsed ? "Quick AI Mentor" : undefined}
          >
            <MessageSquareText size={18} className="shrink-0" />
            {!collapsed && <span className="font-medium whitespace-nowrap text-sm">Quick AI Mentor</span>}
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

      {/* Main Render Area */}
      <main className="student-main-content flex-1 overflow-y-auto">
        <div className="student-view-wrapper">
          {activeTab === 'command-center' && <CommandCenterView user={user} onNavigateSection={(tab) => setActiveTab(tab)} />}
          {activeTab === 'ai-mentor' && <AiMentorView user={user} onNavigateSection={(tab) => setActiveTab(tab)} />}
          {activeTab === 'skillvault' && <SkillVaultView user={user} onUpdateUser={onUpdateUser} />}
          {activeTab === 'radar' && <SkillRadarView />}
          {activeTab === 'resume' && <AiResumeView user={user} />}
          {activeTab === 'opportunities' && <OpportunitiesView />}
          {activeTab === 'mock-interviews' && <MockInterviewsView />}
          {activeTab === 'trends' && <IndustryTrendsView />}
        </div>
      </main>

      {/* AI Mentor Drawer Overlay */}
      {showMentorDrawer && (
        <AiMentorDrawer 
          user={user} 
          onClose={() => setShowMentorDrawer(false)} 
          onNavigateSection={(tab) => { setActiveTab(tab); setShowMentorDrawer(false); }} 
        />
      )}
    </div>
  );
}

