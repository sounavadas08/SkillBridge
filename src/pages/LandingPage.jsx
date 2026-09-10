import React, { useState, useEffect } from 'react';
import Navbar from '../components/main/Navbar';
import Hero from '../components/main/Hero';
import StatsStrip from '../components/main/StatsStrip';
import PlatformArchitecture from '../components/main/PlatformArchitecture';
import CuratedMatches from '../components/main/CuratedMatches';
import SkillGapEngine from '../components/main/SkillGapEngine';
import ApplicationTracker from '../components/main/ApplicationTracker';
import CTASection from '../components/main/CTASection';
import Footer from '../components/main/Footer';
import { useToast } from '../context/ToastContext';
import { ROUTES, navigateTo, getCurrentUser, clearCurrentUser, setCurrentUser } from '../utils/navigation';
import '../App.css';

export default function LandingPage() {
  const [currentUser, setLocalUser] = useState(getCurrentUser);
  const { showToast } = useToast();

  useEffect(() => {
    const syncProfileFromBackend = async () => {
      try {
        const res = await fetch('/api/auth/profile');
        if (res.ok) {
          const profile = await res.json();
          setLocalUser(prev => {
            if (!prev || prev.role === 'student') {
              const merged = { ...(prev || {}), ...profile };
              setCurrentUser(merged);
              return merged;
            }
            return prev;
          });
        }
      } catch (e) {
        // Backend offline
      }
    };
    syncProfileFromBackend();
  }, []);

  const handleLogout = () => {
    clearCurrentUser();
    setLocalUser(null);
    showToast('You have been signed out successfully.', 'info');
  };

  const handleStartStudent = () => {
    navigateTo(`${ROUTES.ONBOARDING}?role=student`);
  };

  const handleStartEmployer = () => {
    navigateTo(`${ROUTES.ONBOARDING}?role=recruiter`);
  };

  return (
    <div className="skillbridge-app">
      <Navbar
        user={currentUser}
        onOpenLogin={() => navigateTo(ROUTES.LOGIN)}
        onOpenOnboarding={() => navigateTo(ROUTES.ONBOARDING)}
        onOpenDashboard={() => navigateTo(ROUTES.PORTAL)}
        onLogout={handleLogout}
        onNavigateLanding={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
      <main>
        <Hero
          onStartStudent={handleStartStudent}
          onStartEmployer={handleStartEmployer}
        />
        <StatsStrip />
        <PlatformArchitecture />
        <CuratedMatches />
        <SkillGapEngine />
        <ApplicationTracker />
        <CTASection
          onStartStudent={handleStartStudent}
          onStartEmployer={handleStartEmployer}
        />
      </main>
      <Footer />
    </div>
  );
}
