import React from 'react';
import { StudentPortalLayout } from '../student/StudentPortalLayout';
import './Login.css';

export default function DashboardView({ user, onLogout, onExploreHome, onUpdateUser }) {
  const isRecruiter = user?.role === 'recruiter';
  
  if (!isRecruiter) {
    return <StudentPortalLayout user={user} onLogout={onLogout} onExploreHome={onExploreHome} onUpdateUser={onUpdateUser} />;
  }

  const displayName = user?.email ? user.email.split('@')[0] : 'Hiring Team';

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="auth-logo-icon" style={{ width: '2rem', height: '2rem', fontSize: '0.9375rem' }}>
            <span>S</span>
          </div>
          <span className="auth-logo-text" style={{ fontSize: '1.125rem' }}>
            SkillBridge <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.875rem' }}>{isRecruiter ? '• Employer Portal' : '• Student Portal'}</span>
          </span>
        </div>

        <div className="dashboard-user-actions">
          {onExploreHome && (
            <button
              type="button"
              onClick={onExploreHome}
              className="auth-link"
              style={{ fontSize: '0.875rem' }}
            >
              ← Back to Main App
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="btn-dashboard-logout"
          >
            Sign Out
          </button>

          <div className="dashboard-avatar" title={user?.email || 'User Avatar'}>
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-role-badge">
          {isRecruiter ? 'Recruiter Account' : 'Student & Candidate'}
        </div>

        <h1 className="dashboard-title">
          {isRecruiter ? `Welcome back, ${displayName}` : `Welcome to your Career Hub, ${displayName}`}
        </h1>
        <p className="dashboard-subtitle">
          {isRecruiter
            ? 'Manage your talent pipeline, review validated candidate skill scores, and post opportunities.'
            : 'Your personalized curriculum, skill gap benchmarks, and matched opportunities are ready.'}
        </p>

        <div className="dashboard-grid">
          {/* Main Feed Card */}
          <div className="dashboard-card">
            <h2 className="dashboard-card-title">
              {isRecruiter ? 'Pre-Vetted Candidate Stream' : 'Your Recommended Skill Pathway'}
            </h2>

            <div className="dashboard-placeholder-box">
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                {isRecruiter
                  ? 'Matched Talent Based on Your Hiring Criteria'
                  : 'Automated Curriculum & Skill Benchmarking'}
              </div>
              <div>
                {isRecruiter
                  ? 'Active candidate matches filtered by your selected skill signals will appear here.'
                  : 'Interactive gap assessments and curated job recommendations have been synchronized.'}
              </div>
              {onExploreHome && (
                <button
                  type="button"
                  onClick={onExploreHome}
                  className="btn-submit-auth"
                  style={{ maxWidth: '240px', marginTop: '1.25rem', padding: '0.625rem 1rem' }}
                >
                  {isRecruiter ? 'Browse Matching Candidates' : 'Explore Skill Engine & Jobs'}
                </button>
              )}
            </div>
          </div>

          {/* Action Checklist Card */}
          <div className="dashboard-card">
            <h2 className="dashboard-card-title">Next Milestones</h2>
            <div className="dashboard-checklist">
              <div className="dashboard-check-item">
                <div className="check-dot">✓</div>
                <div>
                  <div className="check-item-title">
                    {isRecruiter ? 'Onboarding & Goals Setup' : 'Profile Created & Goals Set'}
                  </div>
                  <div className="check-item-desc">5-step profile successfully configured</div>
                </div>
              </div>

              <div className="dashboard-check-item">
                <div className="check-dot" style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                  2
                </div>
                <div>
                  <div className="check-item-title">
                    {isRecruiter ? 'Post Your First Opportunity' : 'Run Radar Skill Gap Test'}
                  </div>
                  <div className="check-item-desc">
                    {isRecruiter ? 'Attract verified candidates' : 'Takes ~10 mins to generate spider chart'}
                  </div>
                </div>
              </div>

              <div className="dashboard-check-item" style={{ opacity: 0.65 }}>
                <div className="check-dot" style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                  3
                </div>
                <div>
                  <div className="check-item-title">
                    {isRecruiter ? 'Schedule Candidate Interviews' : 'Apply to Curated Matches'}
                  </div>
                  <div className="check-item-desc">
                    {isRecruiter ? 'Review direct pipeline applicants' : '3 high-match roles available'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
