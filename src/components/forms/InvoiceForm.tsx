'use client';

import { useState, useEffect } from 'react';
import { type Invoice, type Lead } from '@/lib/types';
import { fetchLeads } from '@/lib/leads-db';
import { generateId } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Receipt, FileText } from 'lucide-react';

interface InvoiceFormProps {
  onSubmit: (invoice: Invoice) => void;
  onClose: () => void;
  nextNumber: number;
}

export default function InvoiceForm({ onSubmit, onClose, nextNumber }: InvoiceFormProps) {
  const invoiceNumber = `INV-2026-${String(nextNumber).padStart(3, '0')}`;

  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadId, setLeadId] = useState('');
  const [service, setService] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadLeads() {
      try {
        const data = await fetchLeads();
        setLeads(data);
      } catch (err) {
        console.error('Failed to load leads in InvoiceForm:', err);
      }
    }
    loadLeads();
  }, []);

  const leadOptions = leads.map((lead) => ({
    value: lead.id,
    label: lead.name,
  }));

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!leadId) newErrors.leadId = 'Please select a client';
    if (!amount || Number(amount) <= 0) newErrors.amount = 'Please enter a valid amount';
    if (!dueDate) newErrors.dueDate = 'Please select a due date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const selectedLead = leads.find((l) => l.id === leadId);
    const invoice: Invoice = {
      id: `inv-${generateId()}`,
      invoiceNumber,
      leadId,
      leadName: selectedLead?.name || '',
      leadPhone: selectedLead?.phone || '',
      service: service || selectedLead?.serviceInterested || '',
      amount: Number(amount),
      status: 'unpaid',
      dueDate,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };

    onSubmit(invoice);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Auto-generated Invoice Number */}
      <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3 flex items-center gap-3">
        <Receipt className="h-5 w-5 text-indigo-600 shrink-0" />
        <div>
          <p className="text-xs font-medium text-indigo-600">Invoice Number</p>
          <p className="text-sm font-bold text-indigo-900">{invoiceNumber}</p>
        </div>
      </div>

      <Select
        label="Client"
        options={[{ value: '', label: 'Select a client...' }, ...leadOptions]}
        value={leadId}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLeadId(e.target.value)}
        error={errors.leadId}
      />

      <div className="relative">
        <Input
          label="Service"
          id="service"
          placeholder="e.g., JEE Coaching - Full Course"
          value={service}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setService(e.target.value)}
        />
        <FileText className="absolute right-3 top-9 h-4 w-4 text-slate-400 pointer-events-none" />
      </div>

      <div className="relative">
        <Input
          label="Amount"
          id="amount"
          type="number"
          placeholder="0"
          value={amount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
          error={errors.amount}
          className="pl-8"
        />
        <span className="absolute left-3 top-9 text-sm font-medium text-slate-500">₹</span>
      </div>

      <Input
        label="Due Date"
        id="dueDate"
        type="date"
        value={dueDate}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)}
        error={errors.dueDate}
      />

      <div>
        <label htmlFor="invoice-notes" className="block text-sm font-medium text-slate-700 mb-1.5">
          Notes
        </label>
        <textarea
          id="invoice-notes"
          rows={3}
          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
          placeholder="Payment terms, special instructions..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          <Receipt className="h-4 w-4 mr-1.5" />
          Create Invoice
        </Button>
      </div>
    </form>
  );
}
