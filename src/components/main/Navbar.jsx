import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import './Navbar.css';

export default function Navbar({
  user,
  onOpenLogin,
  onOpenOnboarding,
  onOpenDashboard,
  onLogout,
  onNavigateLanding,
}) {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onNavigateLanding) {
      onNavigateLanding();
    }
    setTimeout(() => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleAuthAction = (actionName) => {
    setMobileMenuOpen(false);
    if (actionName === 'Sign In' && onOpenLogin) {
      onOpenLogin();
    } else if (actionName === 'Get Started' && onOpenOnboarding) {
      onOpenOnboarding();
    } else {
      showToast(`${actionName} modal opened (Prototype Demo)`, 'info');
    }
  };

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <a href="#" className="brand-logo" onClick={(e) => handleNavClick(e, 'hero')}>
          <div className="brand-icon">
            <img 
              src={theme === 'dark' ? '/logo-icon-dark.png' : '/logo-icon-light.png'} 
              alt="SkillBridge Logo" 
            />
          </div>
          <span className="brand-text">SkillBridge</span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <a
            href="#opportunities"
            className="nav-link"
            onClick={(e) => handleNavClick(e, 'curated-matches')}
          >
            Opportunities
          </a>
          <a
            href="#colleges"
            className="nav-link"
            onClick={(e) => handleNavClick(e, 'platform-architecture')}
          >
            For Colleges
          </a>
          <a
            href="#companies"
            className="nav-link"
            onClick={(e) => handleNavClick(e, 'platform-architecture')}
          >
            For Companies
          </a>
          <a
            href="#demo"
            className="nav-link"
            onClick={(e) => handleNavClick(e, 'skill-gap-engine')}
          >
            Demo View
          </a>
        </nav>

        {/* Right Utility & Auth Controls */}
        <div className="navbar-actions">
          {/* Theme Toggle Button */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <svg
                className="theme-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg
                className="theme-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>

          {/* Auth Controls */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                className="nav-btn-signin"
                onClick={onOpenDashboard}
                title="Go to Dashboard"
              >
                Dashboard
              </button>
              <button
                className="nav-btn-getstarted"
                style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', boxShadow: 'none' }}
                onClick={onLogout}
              >
                Sign Out
              </button>
              <div
                onClick={onOpenDashboard}
                style={{
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--teal-accent), var(--navy-800))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  border: '2px solid var(--bg-card)',
                  boxShadow: '0 0 0 1px var(--border-card)'
                }}
                title={user.email || 'User'}
              >
                {(user.email ? user.email.charAt(0) : (user.role === 'recruiter' ? 'R' : 'S')).toUpperCase()}
              </div>
            </div>
          ) : (
            <>
              {/* Sign In Button */}
              <button
                className="nav-btn-signin"
                onClick={() => handleAuthAction('Sign In')}
              >
                Sign In
              </button>

              {/* Get Started Button */}
              <button
                className="nav-btn-getstarted"
                onClick={() => handleAuthAction('Get Started')}
              >
                Get Started
              </button>
            </>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            className="mobile-hamburger"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
          >
            <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <nav className="mobile-nav">
            <a
              href="#opportunities"
              className="mobile-link"
              onClick={(e) => handleNavClick(e, 'curated-matches')}
            >
              Opportunities
            </a>
            <a
              href="#colleges"
              className="mobile-link"
              onClick={(e) => handleNavClick(e, 'platform-architecture')}
            >
              For Colleges
            </a>
            <a
              href="#companies"
              className="mobile-link"
              onClick={(e) => handleNavClick(e, 'platform-architecture')}
            >
              For Companies
            </a>
            <a
              href="#demo"
              className="mobile-link"
              onClick={(e) => handleNavClick(e, 'skill-gap-engine')}
            >
              Demo View
            </a>
            <div className="mobile-auth-actions">
              {user ? (
                <>
                  <button
                    className="nav-btn-signin w-full"
                    onClick={() => { setMobileMenuOpen(false); onOpenDashboard(); }}
                  >
                    Dashboard ({user.role === 'recruiter' ? 'Employer' : 'Student'})
                  </button>
                  <button
                    className="nav-btn-getstarted w-full"
                    style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
                    onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="nav-btn-signin w-full"
                    onClick={() => handleAuthAction('Sign In')}
                  >
                    Sign In
                  </button>
                  <button
                    className="nav-btn-getstarted w-full"
                    onClick={() => handleAuthAction('Get Started')}
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
