import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider, AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { CLERK_PUBLISHABLE_KEY } from '../utils/clerkAuth';
import '../index.css';

function SSOCallbackPage() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0f0f0f',
        color: '#fff',
        fontFamily: 'sans-serif',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <div style={{
          width: 40, height: 40, border: '3px solid #FF8100',
          borderTop: '3px solid transparent', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p>Signing you in…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <AuthenticateWithRedirectCallback
          afterSignInUrl="/portal.html"
          afterSignUpUrl="/onboarding.html"
        />
      </div>
    </ClerkProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SSOCallbackPage />
  </React.StrictMode>
);
