// AuthFlowContext.tsx
'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthFlowContextType {
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  loginError: string | null;
  setLoginError: (err: string | null) => void;
  usernameModalOpen: boolean;
  setUsernameModalOpen: (open: boolean) => void;
  usernameLoading: boolean;
  setUsernameLoading: (loading: boolean) => void;
  usernameError: string | null;
  setUsernameError: (err: string | null) => void;
  subscribeIntent: boolean;
  setSubscribeIntent: (intent: boolean) => void;
}

const AuthFlowContext = createContext<AuthFlowContextType | undefined>(undefined);

export function AuthFlowProvider({ children }: { children: ReactNode }) {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [usernameModalOpen, setUsernameModalOpen] = useState(false);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [subscribeIntent, setSubscribeIntent] = useState(false);

  return (
    <AuthFlowContext.Provider
      value={{
        loginModalOpen,
        setLoginModalOpen,
        loginError,
        setLoginError,
        usernameModalOpen,
        setUsernameModalOpen,
        usernameLoading,
        setUsernameLoading,
        usernameError,
        setUsernameError,
        subscribeIntent,
        setSubscribeIntent,
      }}
    >
      {children}
    </AuthFlowContext.Provider>
  );
}

export function useAuthFlow() {
  const context = useContext(AuthFlowContext);
  if (context === undefined) {
    throw new Error('useAuthFlow must be used within an AuthFlowProvider');
  }
  return context;
}
