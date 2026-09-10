import React from 'react';
import { StudentPortalLayout } from '../student/StudentPortalLayout';
import { RecruiterPortalLayout } from '../recruiter/RecruiterPortalLayout';
import './Login.css';

export default function DashboardView({ user, onLogout, onExploreHome, onUpdateUser }) {
  const isRecruiter = user?.role === 'recruiter';
  
  if (isRecruiter) {
    return (
      <RecruiterPortalLayout 
        user={user} 
        onLogout={onLogout} 
        onExploreHome={onExploreHome} 
      />
    );
  }

  return (
    <StudentPortalLayout 
      user={user} 
      onLogout={onLogout} 
      onExploreHome={onExploreHome} 
      onUpdateUser={onUpdateUser} 
    />
  );
}
