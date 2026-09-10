import React, { useState, useEffect } from 'react';
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
import { getPortalTab, setPortalTab } from '../../utils/navigation';
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
  const [activeTab, setActiveTab] = useState(() => getPortalTab('command-center'));
  const [showMentorDrawer, setShowMentorDrawer] = useState(false);

  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleHashOrPop = () => {
      const currentHashTab = getPortalTab('command-center');
      setActiveTab(currentHashTab);
    };

    window.addEventListener('hashchange', handleHashOrPop);
    window.addEventListener('popstate', handleHashOrPop);
    return () => {
      window.removeEventListener('hashchange', handleHashOrPop);
      window.removeEventListener('popstate', handleHashOrPop);
    };
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPortalTab(tabId);
  };

  const currentTabItem = NAV_ITEMS.find((item) => item.id === activeTab);

  return (
    <div className="student-portal-container flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar Navigation */}
      <aside 
        style={{ width: collapsed ? '76px' : '270px' }}
        className="student-sidebar flex flex-col border-r border-border bg-card relative shrink-0 transition-all duration-300 z-20"
      >
        <div className="student-sidebar-header h-16 flex items-center px-4 shrink-0 justify-between">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => handleTabChange('command-center')}>
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
                onClick={() => handleTabChange(item.id)}
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
            title={collapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
          >
            {theme === 'dark' ? <Sun size={18} className="shrink-0 text-amber-400" /> : <Moon size={18} />}
            {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
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

      {/* Main Content Area with Apple iOS Liquid Glass Top Header */}
      <div className="student-main-container flex-1 flex flex-col h-screen overflow-hidden">
        {/* Apple iOS Liquid Glass Header Bar */}
        <header className="student-portal-header shrink-0">
          <div className="student-header-left">
            <div className="ios-pill-badge">
              <span className="ios-badge-dot" />
              <span className="ios-badge-text">{currentTabItem?.label || 'Command Center'}</span>
            </div>
            <div className="ios-header-divider" />
            <span className="ios-portal-title">SkillBridge Portal</span>
          </div>

          <div className="student-header-right">
            <button
              onClick={() => setShowMentorDrawer(true)}
              className="ios-glass-action-btn mentor-btn"
              title="Quick AI Mentor"
            >
              <MessageSquareText size={15} />
              <span className="hidden sm:inline">AI Mentor</span>
            </button>

            <button
              onClick={toggleTheme}
              className="ios-glass-action-btn theme-btn"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
            </button>

            {/* Profile Chip */}
            <div 
              className="ios-profile-chip" 
              onClick={() => handleTabChange('skillvault')} 
              title="View SkillVault Profile"
            >
              <img 
                src={user?.avatar || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop&auto=format"} 
                alt={user?.name || "Student"} 
                className="ios-profile-avatar"
              />
              <span className="ios-profile-name hidden md:inline">{user?.name || user?.email?.split('@')[0] || 'Alex Chen'}</span>
            </div>
          </div>
        </header>

        {/* Main Render Area */}
        <main className="student-main-content flex-1 overflow-y-auto">
          <div className="student-view-wrapper">
            {activeTab === 'command-center' && <CommandCenterView user={user} onNavigateSection={handleTabChange} />}
            {activeTab === 'ai-mentor' && <AiMentorView user={user} onNavigateSection={handleTabChange} />}
            {activeTab === 'skillvault' && <SkillVaultView user={user} onUpdateUser={onUpdateUser} />}
            {activeTab === 'radar' && <SkillRadarView />}
            {activeTab === 'resume' && <AiResumeView user={user} />}
            {activeTab === 'opportunities' && <OpportunitiesView />}
            {activeTab === 'mock-interviews' && <MockInterviewsView />}
            {activeTab === 'trends' && <IndustryTrendsView />}
          </div>
        </main>
      </div>

      {/* AI Mentor Drawer Overlay */}
      {showMentorDrawer && (
        <AiMentorDrawer 
          user={user} 
          onClose={() => setShowMentorDrawer(false)} 
          onNavigateSection={(tab) => { handleTabChange(tab); setShowMentorDrawer(false); }} 
        />
      )}
    </div>
  );
}

