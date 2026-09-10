import React, { useState } from 'react';
import { SignIn } from '@clerk/clerk-react';
import { useSafeClerk } from '../../utils/clerkAuth';
import './Login.css';

export default function LoginView({ onLogin, onNewUser, onBackHome }) {
  const { isClerkAvailable, clerk } = useSafeClerk();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [useClerkForm, setUseClerkForm] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    if (onLogin) {
      onLogin({ email, role: 'student' });
    }
  };

  const handleGoogleLogin = async () => {
    if (clerk) {
      try {
        const redirectOpts = {
          strategy: 'oauth_google',
          redirectUrl: `${window.location.origin}/sso-callback`,
          redirectUrlComplete: `${window.location.origin}/portal.html`,
        };

        if (typeof clerk.authenticateWithRedirect === 'function') {
          await clerk.authenticateWithRedirect(redirectOpts);
          return;
        } else if (clerk.client?.signIn?.authenticateWithRedirect) {
          await clerk.client.signIn.authenticateWithRedirect(redirectOpts);
          return;
        }
      } catch (err) {
        console.warn('Clerk Google SSO error:', err);
      }
    }
    // Fallback if Clerk is not available or encounters an error
    if (onLogin) {
      onLogin({ email: 'demo.user@gmail.com', role: 'student', provider: 'google' });
    }
  };


  return (
    <div className="auth-page-wrapper">
      {onBackHome && (
        <button
          type="button"
          onClick={onBackHome}
          className="auth-back-home"
          aria-label="Back to SkillBridge Home"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Home
        </button>
      )}

      <div className="auth-card" style={{ maxWidth: isClerkAvailable && useClerkForm ? '440px' : '400px' }}>
        {/* Logo area */}
        <div className="auth-logo-header">
          <div className="auth-logo-icon">
            <span>S</span>
          </div>
          <span className="auth-logo-text">
            SkillBridge
          </span>
        </div>

        <div className="auth-header-text">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-desc">
            Sign in to access your skill dashboard and opportunities.
          </p>
        </div>

        {isClerkAvailable && useClerkForm ? (
          <div className="clerk-auth-container" style={{ margin: '1rem 0' }}>
            <SignIn
              routing="hash"
              appearance={{
                elements: {
                  card: { background: 'transparent', boxShadow: 'none', padding: 0 },
                  headerTitle: { display: 'none' },
                  headerSubtitle: { display: 'none' },
                  socialButtonsBlockButton: {
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-card, rgba(255, 255, 255, 0.12))',
                    color: 'var(--text-primary, #ffffff)',
                  },
                  formButtonPrimary: {
                    background: 'linear-gradient(135deg, #FF8100, #B85A12)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  },
                  footer: { display: 'none' }
                }
              }}
            />
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setUseClerkForm(false)}
                className="auth-link"
                style={{ fontSize: '0.8125rem' }}
              >
                Use direct password login / demo accounts
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Social Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="btn-social-auth"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.58c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.58-2.77c-.98.66-2.23 1.06-3.7 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            <div className="auth-divider">
              <span className="auth-divider-text">
                or email
              </span>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div style={{ color: '#ef4444', fontSize: '0.8125rem', textAlign: 'center' }}>
                  {error}
                </div>
              )}

              <div className="auth-input-group">
                <label className="auth-label" htmlFor="auth-email">Email address</label>
                <input
                  id="auth-email"
                  type="email"
                  placeholder="alex.morgan@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>

              <div className="auth-input-group">
                <label className="auth-label" htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>

              <div className="auth-actions-row">
                <button
                  type="button"
                  onClick={() => alert('Password reset link has been sent to your email.')}
                  className="auth-link"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="btn-submit-auth"
              >
                Sign In
              </button>

              <div className="auth-quick-demo">
                <span>Quick fill:</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('alex.chen@university.edu');
                    setPassword('student123');
                  }}
                  className="btn-demo-chip"
                >
                  Student Demo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('recruiter@techventures.io');
                    setPassword('recruiter123');
                  }}
                  className="btn-demo-chip"
                >
                  Recruiter Demo
                </button>
              </div>
            </form>

            {isClerkAvailable && (
              <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setUseClerkForm(true)}
                  className="auth-link"
                  style={{ fontSize: '0.8125rem' }}
                >
                  ← Switch to Clerk Sign-In
                </button>
              </div>
            )}
          </>
        )}

        {/* Switch to Onboarding */}
        <div className="auth-footer">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onNewUser}
            className="auth-link"
            style={{ fontSize: '0.875rem' }}
          >
            Create an account
          </button>
        </div>

        <div className="auth-terms">
          By continuing, you agree to SkillBridge Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}

