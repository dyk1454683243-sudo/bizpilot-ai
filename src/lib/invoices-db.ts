import { supabase } from './supabase';
import { type Invoice, type InvoiceStatus } from './types';
import { mockInvoices } from './mock-data';

// Helper to map DB row to Invoice interface
export function mapDbInvoice(row: any): Invoice {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    leadId: row.lead_id || '',
    leadName: row.lead_name,
    leadPhone: row.lead_phone,
    service: row.service,
    amount: Number(row.amount),
    status: row.status as InvoiceStatus,
    dueDate: row.due_date,
    paidAt: row.paid_at || undefined,
    paymentMethod: row.payment_method || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
  };
}

// Helper to map Invoice fields to DB structure
export function mapInvoiceToDb(invoice: Partial<Invoice>) {
  const dbRow: any = {};
  if (invoice.invoiceNumber !== undefined) dbRow.invoice_number = invoice.invoiceNumber;
  if (invoice.leadId !== undefined) dbRow.lead_id = invoice.leadId || null;
  if (invoice.leadName !== undefined) dbRow.lead_name = invoice.leadName;
  if (invoice.leadPhone !== undefined) dbRow.lead_phone = invoice.leadPhone;
  if (invoice.service !== undefined) dbRow.service = invoice.service;
  if (invoice.amount !== undefined) dbRow.amount = invoice.amount;
  if (invoice.status !== undefined) dbRow.status = invoice.status;
  if (invoice.dueDate !== undefined) dbRow.due_date = invoice.dueDate;
  if (invoice.paidAt !== undefined) dbRow.paid_at = invoice.paidAt || null;
  if (invoice.paymentMethod !== undefined) dbRow.payment_method = invoice.paymentMethod || null;
  if (invoice.notes !== undefined) dbRow.notes = invoice.notes;
  return dbRow;
}

// Fetch all invoices for the logged-in user
export async function fetchInvoices(): Promise<Invoice[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }

  // If no invoices are found, automatically seed the database with mock invoices
  if (!data || data.length === 0) {
    try {
      return await seedInitialInvoices(session.user.id);
    } catch (seedError) {
      console.error('Failed to seed default invoices:', seedError);
      return [];
    }
  }

  return data.map(mapDbInvoice);
}

// Create a new invoice for the current logged-in user
export async function createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'>): Promise<Invoice> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  const dbRow = {
    ...mapInvoiceToDb(invoice),
    user_id: session.user.id,
  };

  const { data, error } = await supabase
    .from('invoices')
    .insert([dbRow])
    .select()
    .single();

  if (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }

  return mapDbInvoice(data);
}

// Update an existing invoice
export async function updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
  const dbRow = {
    ...mapInvoiceToDb(updates),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('invoices')
    .update(dbRow)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating invoice ${id}:`, error);
    throw error;
  }

  return mapDbInvoice(data);
}

// Delete an invoice
export async function deleteInvoice(id: string): Promise<void> {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting invoice ${id}:`, error);
    throw error;
  }
}

// Seed mock invoices into Supabase for the current user
async function seedInitialInvoices(userId: string): Promise<Invoice[]> {
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

  const seeds = mockInvoices.map((mockInv) => {
    // Attempt to link to a database lead by matching name
    const cleanName = mockInv.leadName.toLowerCase().trim();
    const matchedLeadId = leadsMap.get(cleanName) || null;

    return {
      id: crypto.randomUUID(),
      user_id: userId,
      lead_id: matchedLeadId,
      invoice_number: mockInv.invoiceNumber,
      lead_name: mockInv.leadName,
      lead_phone: mockInv.leadPhone,
      service: mockInv.service,
      amount: mockInv.amount,
      status: mockInv.status,
      due_date: mockInv.dueDate,
      paid_at: mockInv.paidAt || null,
      payment_method: mockInv.paymentMethod || null,
      notes: mockInv.notes || null,
      created_at: mockInv.createdAt,
    };
  });

  const { data, error } = await supabase
    .from('invoices')
    .insert(seeds)
    .select();

  if (error) {
    console.error('Error inserting seed invoices:', error);
    throw error;
  }

  return data.map(mapDbInvoice);
}
