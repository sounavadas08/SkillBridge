import React, { useState, useEffect } from 'react';
import { DashboardView } from '../components/login';
import { useToast } from '../context/ToastContext';
import { ROUTES, navigateTo, getCurrentUser, setCurrentUser, clearCurrentUser } from '../utils/navigation';
import '../App.css';

const DEFAULT_STUDENT_USER = {
  name: 'Alex Chen',
  email: 'alex.chen@university.edu',
  role: 'student',
  department: 'Computer Science Major',
  organization: 'Tech University',
  grad_year: '2026',
  specialization: 'Full Stack & AI Systems',
  bio: 'Computer Science student passionate about machine learning systems, distributed computing, and building products that scale.',
  avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop&auto=format',
};

export default function PortalPage() {
  const [currentUser, setLocalUser] = useState(() => {
    const saved = getCurrentUser();
    return saved || DEFAULT_STUDENT_USER;
  });
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

  const handleUpdateUser = async (updatedData) => {
    const merged = { ...(currentUser || {}), ...updatedData };
    setLocalUser(merged);
    setCurrentUser(merged);
    try {
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.warn('Backend profile sync failed, kept in local state:', err.message);
    }
  };

  const handleLogout = () => {
    clearCurrentUser();
    showToast('You have been signed out successfully.', 'info');
    navigateTo(ROUTES.HOME);
  };

  const handleExploreHome = () => {
    navigateTo(ROUTES.HOME);
  };

  return (
    <div className="skillbridge-app">
      <DashboardView
        user={currentUser}
        onLogout={handleLogout}
        onExploreHome={handleExploreHome}
        onUpdateUser={handleUpdateUser}
      />
    </div>
  );
}
