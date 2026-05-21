import { supabase } from './supabase';
import { type Invoice, type InvoiceStatus } from './types';

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

  if (!data || data.length === 0) {
    return [];
  }

  return data.map(mapDbInvoice);
}

// Get the next invoice number by finding the highest existing suffix
export async function getNextInvoiceNumber(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return 'INV-2026-001';
  }

  const { data, error } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    return 'INV-2026-001';
  }

  // Parse the highest suffix from existing invoice numbers (e.g., INV-2026-005 -> 5)
  let maxNum = 0;
  for (const row of data) {
    const match = row.invoice_number?.match(/INV-\d{4}-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }

  const year = new Date().getFullYear();
  const nextNum = maxNum + 1;
  return `INV-${year}-${String(nextNum).padStart(3, '0')}`;
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
