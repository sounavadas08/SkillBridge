import React, { useEffect } from 'react';
import { LoginView } from '../components/login';
import { useToast } from '../context/ToastContext';
import { ROUTES, navigateTo, setCurrentUser } from '../utils/navigation';
import { useSafeClerk } from '../utils/clerkAuth';
import '../App.css';

export default function LoginPage() {
  const { showToast } = useToast();
  const { isClerkAvailable, isLoaded, isSignedIn, user } = useSafeClerk();

  useEffect(() => {
    if (isClerkAvailable && isLoaded && isSignedIn && user) {
      showToast(`Signed in as ${user.primaryEmailAddress?.emailAddress || 'Clerk User'}`, 'success');
      navigateTo(ROUTES.PORTAL);
    }
  }, [isClerkAvailable, isLoaded, isSignedIn, user]);

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

