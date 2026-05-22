import { supabase } from './supabase';

export interface Profile {
  id?: string;
  user_id: string;
  business_name: string | null;
  owner_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  business_type: string | null;
  address: string | null;
  logo_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Fetch the profile for the current logged-in user
export async function fetchProfile(): Promise<Profile | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile from Supabase:', error);
    throw error;
  }

  return data;
}

// Upsert a profile for the current user (inserts or updates matching unique user_id constraint)
export async function upsertProfile(profile: Partial<Profile>): Promise<Profile> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  const dbRow = {
    ...profile,
    user_id: session.user.id,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(dbRow, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting profile in Supabase:', error);
    throw error;
  }

  return data;
}
