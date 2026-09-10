import React from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import PortalPage from './pages/PortalPage';

export default function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/';
  
  if (path.includes('login')) {
    return <LoginPage />;
  }
  if (path.includes('onboarding')) {
    return <OnboardingPage />;
  }
  if (path.includes('portal')) {
    return <PortalPage />;
  }
  return <LandingPage />;
}
