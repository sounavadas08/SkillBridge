import React, { useState } from 'react';
import Navbar from './components/main/Navbar';
import Hero from './components/main/Hero';
import StatsStrip from './components/main/StatsStrip';
import PlatformArchitecture from './components/main/PlatformArchitecture';
import CuratedMatches from './components/main/CuratedMatches';
import SkillGapEngine from './components/main/SkillGapEngine';
import ApplicationTracker from './components/main/ApplicationTracker';
import CTASection from './components/main/CTASection';
import Footer from './components/main/Footer';
import { LoginView, OnboardingView, DashboardView } from './components/login';
import { useToast } from './context/ToastContext';
import './App.css';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'login' | 'onboarding' | 'dashboard'
  const [currentUser, setCurrentUser] = useState(null);
  const [onboardingRole, setOnboardingRole] = useState(null);
  const { showToast } = useToast();

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setCurrentView('dashboard');
    showToast(`Welcome back, ${userData.email || 'User'}!`, 'success');
  };

  const handleOnboardingComplete = (onboardingData) => {
    const newUser = {
      email: onboardingData.role === 'recruiter' ? 'recruiter@company.com' : 'student@university.edu',
      ...onboardingData,
    };
    setCurrentUser(newUser);
    setCurrentView('dashboard');
    showToast(
      `Profile completed! Welcome to your ${onboardingData.role === 'recruiter' ? 'Employer Portal' : 'Student Career Hub'}.`,
      'success'
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    showToast('You have been signed out successfully.', 'info');
  };

  const handleStartStudentOnboarding = () => {
    setOnboardingRole('student');
    setCurrentView('onboarding');
  };

  const handleStartEmployerOnboarding = () => {
    setOnboardingRole('recruiter');
    setCurrentView('onboarding');
  };

  return (
    <div className="skillbridge-app">
      {currentView === 'landing' && (
        <>
          <Navbar
            user={currentUser}
            onOpenLogin={() => setCurrentView('login')}
            onOpenOnboarding={() => {
              setOnboardingRole(null);
              setCurrentView('onboarding');
            }}
            onOpenDashboard={() => setCurrentView('dashboard')}
            onLogout={handleLogout}
            onNavigateLanding={() => setCurrentView('landing')}
          />
          <main>
            <Hero
              onStartStudent={handleStartStudentOnboarding}
              onStartEmployer={handleStartEmployerOnboarding}
            />
            <StatsStrip />
            <PlatformArchitecture />
            <CuratedMatches />
            <SkillGapEngine />
            <ApplicationTracker />
            <CTASection
              onStartStudent={handleStartStudentOnboarding}
              onStartEmployer={handleStartEmployerOnboarding}
            />
          </main>
          <Footer />
        </>
      )}

      {currentView === 'login' && (
        <LoginView
          onLogin={handleLoginSuccess}
          onNewUser={() => {
            setOnboardingRole(null);
            setCurrentView('onboarding');
          }}
          onBackHome={() => setCurrentView('landing')}
        />
      )}

      {currentView === 'onboarding' && (
        <OnboardingView
          initialRole={onboardingRole}
          onComplete={handleOnboardingComplete}
          onBackHome={() => setCurrentView('landing')}
          onSwitchToLogin={() => setCurrentView('login')}
        />
      )}

      {currentView === 'dashboard' && (
        <DashboardView
          user={currentUser}
          onLogout={handleLogout}
          onExploreHome={() => setCurrentView('landing')}
        />
      )}
    </div>
  );
}
