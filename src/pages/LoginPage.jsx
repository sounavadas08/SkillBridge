import React from 'react';
import { LoginView } from '../components/login';
import { useToast } from '../context/ToastContext';
import { ROUTES, navigateTo, setCurrentUser } from '../utils/navigation';
import '../App.css';

export default function LoginPage() {
  const { showToast } = useToast();

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    showToast(`Welcome back, ${userData.email || 'User'}!`, 'success');
    navigateTo(ROUTES.PORTAL);
  };

  const handleNewUser = () => {
    navigateTo(ROUTES.ONBOARDING);
  };

  const handleBackHome = () => {
    navigateTo(ROUTES.HOME);
  };

  return (
    <div className="skillbridge-app">
      <LoginView
        onLogin={handleLoginSuccess}
        onNewUser={handleNewUser}
        onBackHome={handleBackHome}
      />
    </div>
  );
}
