'use client';

// ============================================================
// BizPilot AI — Supabase Auth Context
// Integrates authentication with Supabase Auth session tracking
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

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
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
          // Read onboarding preference from metadata or localStorage
          const metadataOnboarded = session.user.user_metadata?.onboarding_completed === true;
          const localOnboarded = localStorage.getItem('onboardingCompleted') === 'true' || localStorage.getItem('bizpilot_onboarded') === 'true';
          if (metadataOnboarded || localOnboarded) {
            setHasCompletedOnboarding(true);
            if (!localOnboarded) {
              localStorage.setItem('onboardingCompleted', 'true');
              localStorage.setItem('bizpilot_onboarded', 'true');
            }
          }
          // Fetch Supabase profile
          try {
            const p = await fetchProfile(session.user.id);
            if (p) {
              setProfile(p);
              if (p.business_name) mockBusiness.name = p.business_name;
              if (p.business_type) mockBusiness.type = p.business_type as any;
              if (p.phone) mockBusiness.whatsappNumber = p.phone;
            }
          } catch (e) {
            console.error('Error loading initial profile:', e);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Error fetching initial Supabase session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
          const metadataOnboarded = session.user.user_metadata?.onboarding_completed === true;
          const localOnboarded = localStorage.getItem('onboardingCompleted') === 'true' || localStorage.getItem('bizpilot_onboarded') === 'true';
          if (metadataOnboarded || localOnboarded) {
            setHasCompletedOnboarding(true);
          } else {
            setHasCompletedOnboarding(false);
          }
          // Fetch profile
          try {
            const p = await fetchProfile(session.user.id);
            if (p) {
              setProfile(p);
              if (p.business_name) mockBusiness.name = p.business_name;
              if (p.business_type) mockBusiness.type = p.business_type as any;
              if (p.phone) mockBusiness.whatsappNumber = p.phone;
            } else {
              setProfile(null);
            }
          } catch (e) {
            console.error('Error fetching profile on auth state change:', e);
          }
        } else {
          setUser(null);
          setProfile(null);
          setHasCompletedOnboarding(false);
        }
        setIsLoading(false);
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
    localStorage.removeItem('onboardingCompleted');
    localStorage.removeItem('bizpilot_onboarded');
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
    localStorage.setItem('bizpilot_onboarded', 'true');
    localStorage.setItem('onboardingCompleted', 'true');

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
