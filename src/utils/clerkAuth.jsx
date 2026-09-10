import React, { createContext, useContext, Component } from 'react';
import { ClerkProvider, useUser, useClerk } from '@clerk/clerk-react';

const ClerkBridgeContext = createContext({
  isClerkAvailable: false,
  isLoaded: true,
  isSignedIn: false,
  user: null,
  clerk: null,
});

class ClerkErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('Clerk initialization failed, falling back to local auth mode:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const fallbackValue = {
        isClerkAvailable: false,
        isLoaded: true,
        isSignedIn: false,
        user: null,
        clerk: null,
      };
      return (
        <ClerkBridgeContext.Provider value={fallbackValue}>
          {this.props.children}
        </ClerkBridgeContext.Provider>
      );
    }
    return this.props.children;
  }
}

function ClerkInnerBridge({ children }) {
  const userResult = useUser();
  const clerk = useClerk();

  const value = {
    isClerkAvailable: true,
    ...userResult,
    clerk,
  };

  return (
    <ClerkBridgeContext.Provider value={value}>
      {children}
    </ClerkBridgeContext.Provider>
  );
}

export const DEFAULT_CLERK_KEY = 'pk_test_aW50ZXJuYWwtbWFrby01MTY3LmNsZXJrLmFjY291bnRzLmRldiQ';

export const CLERK_PUBLISHABLE_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLERK_PUBLISHABLE_KEY) ||
  DEFAULT_CLERK_KEY;

export function SkillBridgeClerkProvider({ publishableKey = CLERK_PUBLISHABLE_KEY, children }) {
  const resolvedKey = (publishableKey || CLERK_PUBLISHABLE_KEY || '').trim();
  const isValidKey = Boolean(
    resolvedKey &&
    typeof resolvedKey === 'string' &&
    resolvedKey.startsWith('pk_') &&
    !resolvedKey.includes('sample') &&
    !resolvedKey.includes('replace_with_yours')
  );

  if (!isValidKey) {
    const fallbackValue = {
      isClerkAvailable: false,
      isLoaded: true,
      isSignedIn: false,
      user: null,
      clerk: null,
    };
    return (
      <ClerkBridgeContext.Provider value={fallbackValue}>
        {children}
      </ClerkBridgeContext.Provider>
    );
  }

  return (
    <ClerkErrorBoundary>
      <ClerkProvider publishableKey={resolvedKey}>
        <ClerkInnerBridge>{children}</ClerkInnerBridge>
      </ClerkProvider>
    </ClerkErrorBoundary>
  );
}

export function useSafeClerk() {
  return useContext(ClerkBridgeContext);
}
