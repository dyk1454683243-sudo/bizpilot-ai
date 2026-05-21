import { supabase } from './supabase';
import { type Appointment, type AppointmentStatus } from './types';
import { mockAppointments } from './mock-data';

// Helper to map DB row to Appointment interface
export function mapDbAppointment(row: any): Appointment {
  return {
    id: row.id,
    leadId: row.lead_id || '',
    leadName: row.lead_name,
    leadPhone: row.lead_phone,
    service: row.service,
    date: row.date,
    time: row.time,
    duration: row.duration,
    status: row.status as AppointmentStatus,
    notes: row.notes || undefined,
    reminderSent: row.reminder_sent,
    createdAt: row.created_at,
  };
}

// Helper to map Appointment fields to DB structure
export function mapAppointmentToDb(appointment: Partial<Appointment>) {
  const dbRow: any = {};
  if (appointment.leadId !== undefined) dbRow.lead_id = appointment.leadId || null;
  if (appointment.leadName !== undefined) dbRow.lead_name = appointment.leadName;
  if (appointment.leadPhone !== undefined) dbRow.lead_phone = appointment.leadPhone;
  if (appointment.service !== undefined) dbRow.service = appointment.service;
  if (appointment.date !== undefined) dbRow.date = appointment.date;
  if (appointment.time !== undefined) dbRow.time = appointment.time;
  if (appointment.duration !== undefined) dbRow.duration = appointment.duration;
  if (appointment.status !== undefined) dbRow.status = appointment.status;
  if (appointment.notes !== undefined) dbRow.notes = appointment.notes;
  if (appointment.reminderSent !== undefined) dbRow.reminder_sent = appointment.reminderSent;
  return dbRow;
}

// Fetch all appointments for the logged-in user
export async function fetchAppointments(): Promise<Appointment[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', session.user.id)
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }

  // If no appointments are found, automatically seed the database with mock appointments
  if (!data || data.length === 0) {
    try {
      return await seedInitialAppointments(session.user.id);
    } catch (seedError) {
      console.error('Failed to seed default appointments:', seedError);
      return [];
    }
  }

  return data.map(mapDbAppointment);
}

// Create a new appointment for the current logged-in user
export async function createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'reminderSent'>): Promise<Appointment> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  const dbRow = {
    ...mapAppointmentToDb(appointment),
    user_id: session.user.id,
    reminder_sent: false,
  };

  const { data, error } = await supabase
    .from('appointments')
    .insert([dbRow])
    .select()
    .single();

  if (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }

  return mapDbAppointment(data);
}

// Update an existing appointment
export async function updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
  const dbRow = {
    ...mapAppointmentToDb(updates),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('appointments')
    .update(dbRow)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating appointment ${id}:`, error);
    throw error;
  }

  return mapDbAppointment(data);
}

// Delete an appointment
export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting appointment ${id}:`, error);
    throw error;
  }
}

// Seed mock appointments into Supabase for the current user
async function seedInitialAppointments(userId: string): Promise<Appointment[]> {
  // First, fetch the user's leads from the database to link them correctly if names match
  const { data: dbLeads } = await supabase
    .from('leads')
    .select('id, name')
    .eq('user_id', userId);

  const leadsMap = new Map<string, string>();
  if (dbLeads) {
    dbLeads.forEach((lead: any) => {
      leadsMap.set(lead.name.toLowerCase().trim(), lead.id);
    });
  }

  const seeds = mockAppointments.map((mockApt) => {
    // Attempt to link to a database lead by matching client name
    const cleanName = mockApt.leadName.toLowerCase().trim();
    const matchedLeadId = leadsMap.get(cleanName) || null;

    return {
      id: crypto.randomUUID(),
      user_id: userId,
      lead_id: matchedLeadId,
      lead_name: mockApt.leadName,
      lead_phone: mockApt.leadPhone,
      lead_email: null, // Default placeholder
      service: mockApt.service,
      date: mockApt.date,
      time: mockApt.time,
      duration: mockApt.duration,
      status: mockApt.status,
      notes: mockApt.notes || null,
      reminder_sent: mockApt.reminderSent,
      created_at: mockApt.createdAt,
    };
  });

  const { data, error } = await supabase
    .from('appointments')
    .insert(seeds)
    .select();

  if (error) {
    console.error('Error inserting seed appointments:', error);
    throw error;
  }

  return data.map(mapDbAppointment);
}
