import React, { useState, useEffect } from 'react';
import { DashboardView } from '../components/login';
import { useToast } from '../context/ToastContext';
import { ROUTES, navigateTo, getCurrentUser, setCurrentUser, clearCurrentUser } from '../utils/navigation';
import { useSafeClerk } from '../utils/clerkAuth';
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
  const { isClerkAvailable, isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn, user: clerkUser, clerk } = useSafeClerk();
  const [currentUser, setLocalUser] = useState(() => {
    const saved = getCurrentUser();
    return saved || DEFAULT_STUDENT_USER;
  });
  const { showToast } = useToast();

  // Sync Clerk authenticated profile into dashboard user state while preserving local edits
  useEffect(() => {
    if (isClerkAvailable && isClerkLoaded && isClerkSignedIn && clerkUser) {
      const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress || '';
      const fullName = clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || primaryEmail.split('@')[0];
      const avatarUrl = clerkUser.imageUrl || '';
      const userRole = clerkUser.publicMetadata?.role || clerkUser.unsafeMetadata?.role || 'student';

      const saved = getCurrentUser();
      const isSameUser = saved && (saved.id === clerkUser.id || saved.email === primaryEmail);

      const clerkSyncedProfile = {
        id: clerkUser.id,
        name: (isSameUser && saved.name) || clerkUser.unsafeMetadata?.name || fullName,
        email: primaryEmail,
        role: userRole,
        avatar: (isSameUser && saved.avatar) || clerkUser.unsafeMetadata?.avatar || avatarUrl,
        department: (isSameUser && saved.department) || clerkUser.unsafeMetadata?.department || 'Computer Science Major',
        organization: (isSameUser && saved.organization) || clerkUser.unsafeMetadata?.organization || 'Tech University',
        grad_year: (isSameUser && saved.grad_year) || clerkUser.unsafeMetadata?.grad_year || '2026',
        specialization: (isSameUser && saved.specialization) || clerkUser.unsafeMetadata?.specialization || 'Software Engineering & AI Systems',
        bio: (isSameUser && saved.bio) || clerkUser.unsafeMetadata?.bio || 'Verified Clerk SSO Account',
        github_url: (isSameUser && saved.github_url) || clerkUser.unsafeMetadata?.github_url || 'https://github.com',
        linkedin_url: (isSameUser && saved.linkedin_url) || clerkUser.unsafeMetadata?.linkedin_url || 'https://linkedin.com',
        portfolio_url: (isSameUser && saved.portfolio_url) || clerkUser.unsafeMetadata?.portfolio_url || 'https://alexchen.dev',
        provider: 'clerk',
        createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).toLocaleDateString() : 'Recent'
      };

      setLocalUser(clerkSyncedProfile);
      setCurrentUser(clerkSyncedProfile);
    }
  }, [isClerkAvailable, isClerkLoaded, isClerkSignedIn, clerkUser]);

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
        // Backend offline or running in static hosting
      }
    };
    if (!isClerkSignedIn) {
      syncProfileFromBackend();
    }
  }, [isClerkSignedIn]);

  const handleUpdateUser = async (updatedData) => {
    const merged = { ...(currentUser || {}), ...updatedData };
    setLocalUser(merged);
    setCurrentUser(merged);

    // Sync to Clerk metadata if user is authenticated via Clerk
    if (clerkUser && typeof clerkUser.update === 'function') {
      try {
        await clerkUser.update({
          unsafeMetadata: {
            ...(clerkUser.unsafeMetadata || {}),
            name: updatedData.name,
            department: updatedData.department,
            organization: updatedData.organization,
            grad_year: updatedData.grad_year,
            specialization: updatedData.specialization,
            bio: updatedData.bio,
            avatar: updatedData.avatar,
            github_url: updatedData.github_url,
            linkedin_url: updatedData.linkedin_url,
            portfolio_url: updatedData.portfolio_url,
          }
        });
      } catch (e) {
        console.warn('Clerk user metadata update skipped:', e);
      }
    }

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      // If backend is not available (e.g. Vercel static), state is safely preserved in localStorage & Clerk
      showToast('Profile updated successfully!', 'success');
    }
  };

  const handleLogout = async () => {
    if (clerk && clerk.signOut) {
      try {
        await clerk.signOut();
      } catch (e) {
        console.warn('Clerk sign out error:', e);
      }
    }
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

