'use client';

// ============================================================
// BizPilot AI — Mock Auth Context
// Simulates authentication with localStorage persistence
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { type User } from '@/lib/types';
import { mockUser } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (name: string, email: string) => void;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const stored = localStorage.getItem('bizpilot_user');
    const loggedOut = localStorage.getItem('bizpilot_logged_out') === 'true';
    const onboarded = localStorage.getItem('onboardingCompleted') === 'true' || localStorage.getItem('bizpilot_onboarded') === 'true';
    
    if (stored) {
      setUser(JSON.parse(stored));
    } else if (!loggedOut) {
      // If no saved user exists and not explicitly logged out, use fallback
      const fallbackUser: User = {
        id: 'user-001',
        name: 'Deshraj Verma',
        email: 'deshraj@bizpilot.ai',
        role: 'owner',
        businessId: 'biz-001',
        createdAt: '2026-01-15T10:00:00Z',
      };
      setUser(fallbackUser);
      localStorage.setItem('bizpilot_user', JSON.stringify(fallbackUser));
    }
    
    if (onboarded) {
      setHasCompletedOnboarding(true);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Check if user is in localStorage or use mockUser fallback
    const stored = localStorage.getItem('bizpilot_user');
    const baseUser = stored ? JSON.parse(stored) : mockUser;
    
    const loggedInUser: User = {
      ...baseUser,
      email,
      // If logging in, ensure name is fallback or set
      name: baseUser.name || 'Deshraj Verma',
    };
    setUser(loggedInUser);
    localStorage.setItem('bizpilot_user', JSON.stringify(loggedInUser));
    localStorage.removeItem('bizpilot_logged_out');
    const onboarded = localStorage.getItem('onboardingCompleted') === 'true' || localStorage.getItem('bizpilot_onboarded') === 'true';
    setHasCompletedOnboarding(onboarded);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const stored = localStorage.getItem('bizpilot_user');
    const baseUser = stored ? JSON.parse(stored) : mockUser;
    
    setUser(baseUser);
    localStorage.setItem('bizpilot_user', JSON.stringify(baseUser));
    localStorage.removeItem('bizpilot_logged_out');
    const onboarded = localStorage.getItem('onboardingCompleted') === 'true' || localStorage.getItem('bizpilot_onboarded') === 'true';
    setHasCompletedOnboarding(onboarded);
  }, []);

  const signup = useCallback(async (name: string, email: string, _password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newUser: User = {
      ...mockUser,
      name,
      email,
    };
    setUser(newUser);
    localStorage.setItem('bizpilot_user', JSON.stringify(newUser));
    localStorage.removeItem('bizpilot_logged_out');
    setHasCompletedOnboarding(false);
    localStorage.removeItem('onboardingCompleted');
    localStorage.removeItem('bizpilot_onboarded');
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setHasCompletedOnboarding(false);
    localStorage.removeItem('bizpilot_user');
    localStorage.setItem('bizpilot_logged_out', 'true');
  }, []);

  const updateUser = useCallback((name: string, email: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, name, email };
      localStorage.setItem('bizpilot_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    setHasCompletedOnboarding(true);
    localStorage.setItem('bizpilot_onboarded', 'true');
    localStorage.setItem('onboardingCompleted', 'true');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        signup,
        logout,
        updateUser,
        hasCompletedOnboarding,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
