import { supabase } from './supabase';
import { type Lead, type LeadStatus, type LeadSource, type LeadActivity } from './types';
import { mockLeads } from './mock-data';

// Helper to map DB row to Lead interface
export function mapDbLead(row: any): Lead {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email || undefined,
    status: row.status as LeadStatus,
    source: row.source as LeadSource,
    score: row.score,
    notes: row.notes || '',
    serviceInterested: row.service_interested || undefined,
    assignedTo: row.assigned_to || undefined,
    lastContactedAt: row.last_contacted_at || undefined,
    nextFollowUpAt: row.next_follow_up_at || undefined,
    activities: (row.activities || []) as LeadActivity[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Helper to map Lead fields to DB snake_case structure
export function mapLeadToDb(lead: Partial<Lead>) {
  const dbRow: any = {};
  if (lead.name !== undefined) dbRow.name = lead.name;
  if (lead.phone !== undefined) dbRow.phone = lead.phone;
  if (lead.email !== undefined) dbRow.email = lead.email;
  if (lead.status !== undefined) dbRow.status = lead.status;
  if (lead.source !== undefined) dbRow.source = lead.source;
  if (lead.score !== undefined) dbRow.score = lead.score;
  if (lead.notes !== undefined) dbRow.notes = lead.notes;
  if (lead.serviceInterested !== undefined) dbRow.service_interested = lead.serviceInterested;
  if (lead.assignedTo !== undefined) dbRow.assigned_to = lead.assignedTo;
  if (lead.lastContactedAt !== undefined) dbRow.last_contacted_at = lead.lastContactedAt;
  if (lead.nextFollowUpAt !== undefined) dbRow.next_follow_up_at = lead.nextFollowUpAt;
  if (lead.activities !== undefined) dbRow.activities = lead.activities;
  return dbRow;
}

// Fetch all leads for the logged-in user
export async function fetchLeads(): Promise<Lead[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', session.user.id)
    .order('score', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }

  // If no leads are found, automatically seed the database with mock leads
  if (!data || data.length === 0) {
    try {
      return await seedInitialLeads(session.user.id);
    } catch (seedError) {
      console.error('Failed to seed default leads:', seedError);
      return [];
    }
  }

  return data.map(mapDbLead);
}

// Fetch a single lead by ID
export async function fetchLeadById(id: string): Promise<Lead | null> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching lead with ID ${id}:`, error);
    return null;
  }

  return data ? mapDbLead(data) : null;
}

// Create a new lead for the current logged-in user
export async function createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  const dbRow = {
    ...mapLeadToDb(lead),
    user_id: session.user.id,
  };

  const { data, error } = await supabase
    .from('leads')
    .insert([dbRow])
    .select()
    .single();

  if (error) {
    console.error('Error creating lead:', error);
    throw error;
  }

  return mapDbLead(data);
}

// Update an existing lead
export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
  const dbRow = {
    ...mapLeadToDb(updates),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('leads')
    .update(dbRow)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating lead ${id}:`, error);
    throw error;
  }

  return mapDbLead(data);
}

// Delete a lead
export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting lead ${id}:`, error);
    throw error;
  }
}

// Seed mock leads into Supabase for the current user
async function seedInitialLeads(userId: string): Promise<Lead[]> {
  const seeds = mockLeads.map((mockLead) => {
    // Generate valid UUIDs for the seed data so it conforms to the DB primary key constraint
    const generatedId = crypto.randomUUID();
    const updatedActivities = mockLead.activities.map((act) => ({
      ...act,
      id: crypto.randomUUID(),
      leadId: generatedId,
    }));

    return {
      id: generatedId,
      user_id: userId,
      name: mockLead.name,
      phone: mockLead.phone,
      email: mockLead.email || null,
      source: mockLead.source,
      status: mockLead.status,
      score: mockLead.score,
      notes: mockLead.notes,
      service_interested: mockLead.serviceInterested || null,
      last_contacted_at: mockLead.lastContactedAt || null,
      next_follow_up_at: mockLead.nextFollowUpAt || null,
      activities: JSON.stringify(updatedActivities),
      created_at: mockLead.createdAt,
      updated_at: mockLead.updatedAt,
    };
  });

  const { data, error } = await supabase
    .from('leads')
    .insert(seeds)
    .select();

  if (error) {
    console.error('Error inserting seed leads:', error);
    throw error;
  }

  return data.map(mapDbLead);
}
