/**
 * Navigation and session persistence utilities for SkillBridge MPA
 */

export const ROUTES = {
  HOME: '/index.html',
  LOGIN: '/login.html',
  ONBOARDING: '/onboarding.html',
  PORTAL: '/portal.html',
};

/**
 * Navigate cleanly between pages in the application
 * Creates a standard browser history entry
 */
export function navigateTo(path) {
  if (typeof window !== 'undefined') {
    window.location.assign(path);
  }
}

/**
 * Get current authenticated/stored user from localStorage
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('skillbridge_user');
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    console.error('Error reading user from localStorage:', err);
    return null;
  }
}

/**
 * Persist user data to localStorage
 */
export function setCurrentUser(user) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('skillbridge_user', JSON.stringify(user));
  } catch (err) {
    console.error('Error saving user to localStorage:', err);
  }
}

/**
 * Clear user session from localStorage
 */
export function clearCurrentUser() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('skillbridge_user');
  } catch (err) {
    console.error('Error clearing user from localStorage:', err);
  }
}

/**
 * Get active tab ID from URL hash (e.g. #skillvault -> 'skillvault')
 */
export function getPortalTab(defaultTab = 'command-center') {
  if (typeof window === 'undefined') return defaultTab;
  const hash = window.location.hash.replace(/^#/, '').trim();
  return hash || defaultTab;
}

/**
 * Update URL hash to push/set tab in browser history
 */
export function setPortalTab(tabId) {
  if (typeof window === 'undefined' || !tabId) return;
  const cleanTab = tabId.replace(/^#/, '').trim();
  if (window.location.hash.replace(/^#/, '') !== cleanTab) {
    window.location.hash = cleanTab;
  }
}
