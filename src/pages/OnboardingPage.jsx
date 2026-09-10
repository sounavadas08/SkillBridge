import React, { useMemo } from 'react';
import { OnboardingView } from '../components/login';
import { useToast } from '../context/ToastContext';
import { ROUTES, navigateTo, setCurrentUser } from '../utils/navigation';
import '../App.css';

export default function OnboardingPage() {
  const { showToast } = useToast();

  const initialRole = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role');
    return role === 'student' || role === 'recruiter' ? role : null;
  }, []);

  const handleOnboardingComplete = (onboardingData) => {
    const newUser = {
      email: onboardingData.role === 'recruiter' ? 'recruiter@company.com' : 'student@university.edu',
      ...onboardingData,
    };
    setCurrentUser(newUser);
    showToast(
      `Profile completed! Welcome to your ${onboardingData.role === 'recruiter' ? 'Employer Portal' : 'Student Career Hub'}.`,
      'success'
    );
    navigateTo(ROUTES.PORTAL);
  };

  const handleSwitchToLogin = () => {
    navigateTo(ROUTES.LOGIN);
  };

  const handleBackHome = () => {
    navigateTo(ROUTES.HOME);
  };

  return (
    <div className="skillbridge-app">
      <OnboardingView
        initialRole={initialRole}
        onComplete={handleOnboardingComplete}
        onBackHome={handleBackHome}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
}
