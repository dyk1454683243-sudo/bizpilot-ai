'use client';

// ============================================================
// BizPilot AI — Supabase Auth Context
// Integrates authentication with Supabase Auth session tracking
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { type User } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { type Profile, fetchProfile } from '@/lib/profiles-db';
import { mockBusiness } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (name: string, email: string) => Promise<void>;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to map Supabase auth user to application User interface
const mapSupabaseUser = (sbUser: any): User => {
  return {
    id: sbUser.id,
    name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'User',
    email: sbUser.email || '',
    role: 'owner', // Default role for the primary dashboard creator
    businessId: 'biz-001', // Scoped mock business ID for simulation fallback
    createdAt: sbUser.created_at || new Date().toISOString(),
  };
};

// Helper to create fallback empty/default profile
const createDefaultProfile = (userId: string, email?: string, name?: string): Profile => {
  return {
    user_id: userId,
    business_name: mockBusiness.name || '',
    owner_name: name || '',
    phone: mockBusiness.whatsappNumber || '',
    email: email || '',
    website: '',
    business_type: mockBusiness.type || '',
    address: '123, MG Road, Pune, Maharashtra 411001',
  };
};

// Helper to fetch profile with a safety timeout to prevent blocking page loads
const fetchProfileWithTimeout = async (userId: string, timeoutMs: number = 3000): Promise<Profile | null> => {
  try {
    return await Promise.race([
      fetchProfile(userId),
      new Promise<null>((resolve) =>
        setTimeout(() => {
          console.warn(`Profile fetch timed out for user ${userId} after ${timeoutMs}ms`);
          resolve(null);
        }, timeoutMs)
      ),
    ]);
  } catch (err) {
    console.error('fetchProfileWithTimeout caught error:', err);
    return null;
  }
};

// Safe LocalStorage access wrappers to prevent crashes in sandboxed/restricted environments
const safeGetItem = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch (e) {
    console.warn('Error reading from localStorage:', e);
  }
  return null;
};

const safeSetItem = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn('Error writing to localStorage:', e);
  }
};

const safeRemoveItem = (key: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn('Error removing from localStorage:', e);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const currentUserIdRef = useRef<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      const p = await fetchProfile(user.id);
      if (p) {
        setProfile(p);
        if (p.business_name) mockBusiness.name = p.business_name;
        if (p.business_type) mockBusiness.type = p.business_type as any;
        if (p.phone) mockBusiness.whatsappNumber = p.phone;
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  }, [user?.id]);

  // Synchronize state and listen to session changes on mount
  useEffect(() => {
    const handleUserSession = (session: any) => {
      try {
        if (session?.user) {
          const u = mapSupabaseUser(session.user);
          setUser(u);
          const userId = session.user.id;
          currentUserIdRef.current = userId;

          // Read onboarding preference from metadata or localStorage
          const metadataOnboarded = session.user.user_metadata?.onboarding_completed === true;
          const localOnboarded = safeGetItem('onboardingCompleted') === 'true' || safeGetItem('bizpilot_onboarded') === 'true';
          if (metadataOnboarded || localOnboarded) {
            setHasCompletedOnboarding(true);
            if (!localOnboarded) {
              safeSetItem('onboardingCompleted', 'true');
              safeSetItem('bizpilot_onboarded', 'true');
            }
          } else {
            setHasCompletedOnboarding(false);
          }

          // Fetch Supabase profile in background
          const userEmail = session.user.email;
          const userName = session.user.user_metadata?.name || u.name;

          fetchProfileWithTimeout(userId)
            .then((p) => {
              if (currentUserIdRef.current === userId) {
                if (p) {
                  setProfile(p);
                  if (p.business_name) mockBusiness.name = p.business_name;
                  if (p.business_type) mockBusiness.type = p.business_type as any;
                  if (p.phone) mockBusiness.whatsappNumber = p.phone;
                } else {
                  setProfile(createDefaultProfile(userId, userEmail, userName));
                }
              }
            })
            .catch((e) => {
              console.error('Background profile fetch failed:', e);
              if (currentUserIdRef.current === userId) {
                setProfile(createDefaultProfile(userId, userEmail, userName));
              }
            });
        } else {
          setUser(null);
          setProfile(null);
          currentUserIdRef.current = null;
          setHasCompletedOnboarding(false);
        }
      } catch (err) {
        console.error('Error in handleUserSession:', err);
      }
    };

    const getInitialSession = async () => {
      try {
        // Race the getSession call against a 3 second safety timeout
        const session = await Promise.race([
          supabase.auth.getSession().then(({ data }) => data?.session || null),
          new Promise<null>((resolve) =>
            setTimeout(() => {
              console.warn('Initial session fetch timed out after 3000ms');
              resolve(null);
            }, 3000)
          ),
        ]);
        handleUserSession(session);
      } catch (err) {
        console.error('Error fetching initial Supabase session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: any, session: any) => {
        try {
          handleUserSession(session);
        } catch (err) {
          console.error('Error handling auth state change event:', err);
        } finally {
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);


  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
      },
    });
    if (error) throw error;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          onboarding_completed: false,
        },
      },
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear onboarding status locally
    safeRemoveItem('onboardingCompleted');
    safeRemoveItem('bizpilot_onboarded');
    setHasCompletedOnboarding(false);
    setUser(null);
    setProfile(null);
  }, []);

  const updateUser = useCallback(async (name: string, email: string) => {
    const { data, error } = await supabase.auth.updateUser({
      email,
      data: { name },
    });
    if (error) throw error;
    if (data.user) {
      setUser(mapSupabaseUser(data.user));
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    setHasCompletedOnboarding(true);
    safeSetItem('bizpilot_onboarded', 'true');
    safeSetItem('onboardingCompleted', 'true');

    // Update Supabase user metadata
    try {
      await supabase.auth.updateUser({
        data: { onboarding_completed: true },
      });
    } catch (err) {
      console.error('Failed to sync onboarding completed to Supabase:', err);
    }
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
        profile,
        refreshProfile,
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
