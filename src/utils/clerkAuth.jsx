import React, { createContext, useContext } from 'react';
import { ClerkProvider, useUser, useClerk, useSignIn } from '@clerk/clerk-react';

const ClerkBridgeContext = createContext({
  isClerkAvailable: false,
  isLoaded: true,
  isSignedIn: false,
  user: null,
  clerk: null,
  signIn: null,
});

function ClerkInnerBridge({ children }) {
  const userResult = useUser();
  const clerk = useClerk();
  const { signIn } = useSignIn();

  const value = {
    isClerkAvailable: true,
    ...userResult,
    clerk,
    signIn,
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
    <ClerkProvider publishableKey={publishableKey.trim()}>
      <ClerkInnerBridge>{children}</ClerkInnerBridge>
    </ClerkProvider>
  );
}

export function useSafeClerk() {
  return useContext(ClerkBridgeContext);
}
