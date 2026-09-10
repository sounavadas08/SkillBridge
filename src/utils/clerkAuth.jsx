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

export function SkillBridgeClerkProvider({ publishableKey, children }) {
  const isValidKey = Boolean(
    publishableKey &&
    typeof publishableKey === 'string' &&
    publishableKey.trim().startsWith('pk_') &&
    !publishableKey.includes('sample') &&
    !publishableKey.includes('replace_with_yours')
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
      <ClerkProvider publishableKey={publishableKey.trim()}>
        <ClerkInnerBridge>{children}</ClerkInnerBridge>
      </ClerkProvider>
    </ClerkErrorBoundary>
  );
}

export function useSafeClerk() {
  return useContext(ClerkBridgeContext);
}
