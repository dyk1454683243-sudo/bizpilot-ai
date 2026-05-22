'use client';

import { useState, useMemo, useEffect } from 'react';
import clsx from 'clsx';
import { type Invoice, type InvoiceStatus } from '@/lib/types';
import { formatCurrency, formatDate, getInvoiceStatusColor } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import { StatCard } from '@/components/ui/Card';
import InvoiceForm from '@/components/forms/InvoiceForm';
import { useToast } from '@/contexts/ToastContext';
import {
  fetchInvoices,
  createInvoice as createInvoiceDb,
  updateInvoice as updateInvoiceDb,
  deleteInvoice as deleteInvoiceDb,
  getNextInvoiceNumber,
} from '@/lib/invoices-db';
import {
  Receipt,
  Plus,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  Send,
  Eye,
  CreditCard,
  Clock,
  Banknote,
  Trash2,
  Pencil,
} from 'lucide-react';

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'overdue', label: 'Overdue' },
];

function getAmountColor(status: InvoiceStatus) {
  switch (status) {
    case 'paid':
      return 'text-emerald-600';
    case 'unpaid':
      return 'text-amber-600';
    case 'overdue':
      return 'text-rose-600';
  }
}

function getStatusLabel(status: InvoiceStatus) {
  switch (status) {
    case 'paid':
      return '✅ Paid';
    case 'unpaid':
      return '⏳ Unpaid';
    case 'overdue':
      return '⚠️ Overdue';
  }
}

export default function InvoicesPage() {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [sentReminders, setSentReminders] = useState<Set<string>>(new Set());

  const [nextInvoiceNum, setNextInvoiceNum] = useState<string>('INV-2026-001');

  // Fetch invoices and next invoice number on mount
  useEffect(() => {
    async function loadInvoices() {
      try {
        setIsLoading(true);
        const [data, nextNum] = await Promise.all([
          fetchInvoices(),
          getNextInvoiceNumber(),
        ]);
        setInvoices(data);
        setNextInvoiceNum(nextNum);
      } catch (err: any) {
        console.error('Failed to fetch invoices:', err);
        setError(err.message || 'Failed to load invoices.');
      } finally {
        setIsLoading(false);
      }
    }
    loadInvoices();
  }, []);

  // Revenue stats
  const totalRevenue = useMemo(
    () => invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
    [invoices]
  );

  const outstanding = useMemo(
    () => invoices.filter((i) => i.status === 'unpaid').reduce((sum, i) => sum + i.amount, 0),
    [invoices]
  );

  const overdue = useMemo(
    () => invoices.filter((i) => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0),
    [invoices]
  );

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices];
    if (statusFilter !== 'all') {
      filtered = filtered.filter((i) => i.status === statusFilter);
    }
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [invoices, statusFilter]);

  async function markAsPaid(id: string) {
    try {
      const updated = await updateInvoiceDb(id, {
        status: 'paid',
        paidAt: new Date().toISOString(),
        paymentMethod: 'UPI',
      });
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? updated : inv))
      );
      showToast(`Invoice ${updated.invoiceNumber} marked as paid successfully!`, 'success');
    } catch (err: any) {
      console.error('Error marking invoice as paid:', err);
      showToast('Failed to mark invoice as paid.', 'error');
    }
  }

  function handleSendReminder(id: string) {
    setSentReminders((prev) => new Set(prev).add(id));
    const inv = invoices.find((i) => i.id === id);
    showToast(`SMS & WhatsApp payment reminder sent to ${inv?.leadName} (Simulated)`, 'success');
  }

  async function handleNewInvoice(invoice: Invoice) {
    try {
      const created = await createInvoiceDb({
        invoiceNumber: invoice.invoiceNumber,
        leadId: invoice.leadId,
        leadName: invoice.leadName,
        leadPhone: invoice.leadPhone,
        service: invoice.service,
        amount: invoice.amount,
        status: 'unpaid',
        dueDate: invoice.dueDate,
        notes: invoice.notes,
      });
      setInvoices((prev) => [created, ...prev]);
      setIsFormOpen(false);
      showToast(`Invoice ${created.invoiceNumber} created and sent successfully!`, 'success');
      // Re-fetch the next invoice number after creation
      try {
        const nextNum = await getNextInvoiceNumber();
        setNextInvoiceNum(nextNum);
      } catch {
        // Fallback: increment from current invoice number
      }
    } catch (err: any) {
      console.error('Error creating invoice:', err);
      showToast('Failed to create invoice.', 'error');
    }
  }

  async function handleDeleteInvoice(id: string) {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;
    if (!confirm(`Are you sure you want to delete invoice ${inv.invoiceNumber}?`)) {
      return;
    }
    try {
      await deleteInvoiceDb(id);
      setInvoices((prev) => prev.filter((i) => i.id !== id));
      showToast(`Invoice ${inv.invoiceNumber} deleted successfully!`, 'success');
    } catch (err: any) {
      console.error('Error deleting invoice:', err);
      showToast('Failed to delete invoice.', 'error');
    }
  }

  async function handleEditInvoiceSubmit(updatedInvoice: Invoice) {
    try {
      const updated = await updateInvoiceDb(updatedInvoice.id, {
        leadId: updatedInvoice.leadId,
        leadName: updatedInvoice.leadName,
        leadPhone: updatedInvoice.leadPhone,
        service: updatedInvoice.service,
        amount: updatedInvoice.amount,
        status: updatedInvoice.status,
        dueDate: updatedInvoice.dueDate,
        notes: updatedInvoice.notes,
        paidAt: updatedInvoice.status === 'paid' ? (editingInvoice?.paidAt || new Date().toISOString()) : null,
        paymentMethod: updatedInvoice.status === 'paid' ? (editingInvoice?.paymentMethod || 'UPI') : null,
      });
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === updated.id ? updated : inv))
      );
      setEditingInvoice(null);
      showToast(`Invoice ${updated.invoiceNumber} updated successfully!`, 'success');
    } catch (err: any) {
      console.error('Error updating invoice:', err);
      showToast('Failed to update invoice.', 'error');
    }
  }



  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-8 text-center animate-fade-in">
        <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
        <p className="text-rose-800 font-semibold mb-1">Failed to load invoices</p>
        <p className="text-sm text-rose-600 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="h-6 w-6 text-indigo-600" />
            Invoices & Payments
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Track payments and manage invoices</p>
        </div>
        <Button variant="primary" onClick={() => setIsFormOpen(true)} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-1.5" />
          Create Invoice
        </Button>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<IndianRupee className="h-5 w-5 text-emerald-600" />}
          label="Total Revenue"
          value={isLoading ? '...' : formatCurrency(totalRevenue)}
          className="border border-emerald-100 bg-emerald-50/30"
          iconBgClass="bg-emerald-100/80 text-emerald-700"
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          label="Outstanding"
          value={isLoading ? '...' : formatCurrency(outstanding)}
          className="border border-amber-100 bg-amber-50/30"
          iconBgClass="bg-amber-100/80 text-amber-700"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-rose-600" />}
          label="Overdue"
          value={isLoading ? '...' : formatCurrency(overdue)}
          className="border border-rose-100 bg-rose-50/30"
          iconBgClass="bg-rose-100/80 text-rose-700"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Showing <span className="font-semibold text-slate-900">{isLoading ? '...' : filteredInvoices.length}</span> invoices
        </p>
        <div className="w-full sm:w-48">
          <Select
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-slate-200 rounded w-1/4" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
              <div className="h-6 bg-slate-200 rounded w-16" />
            </div>
          ))
        ) : filteredInvoices.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No invoices found</p>
            <p className="text-sm text-slate-400 mt-1">Create your first invoice to get started</p>
          </div>
        ) : (
          filteredInvoices.map((inv) => (
            <div
              key={inv.id}
              className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left side */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-base">{inv.invoiceNumber}</h3>
                    <Badge className={getInvoiceStatusColor(inv.status)}>
                      {getStatusLabel(inv.status)}
                    </Badge>
                    {inv.paymentMethod && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 rounded-full px-2 py-0.5">
                        <CreditCard className="h-3 w-3" />
                        {inv.paymentMethod}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-1.5">
                    <span className="font-medium">{inv.leadName}</span>
                    <span className="text-slate-400 mx-2">·</span>
                    {inv.service}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>Due: {formatDate(inv.dueDate)}</span>
                    {inv.paidAt && <span>Paid: {formatDate(inv.paidAt)}</span>}
                    {sentReminders.has(inv.id) && (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Reminder sent
                      </span>
                    )}
                  </div>
                  {/* Amount & Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-100 sm:border-t-0">
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto">
                    <span className="text-xs text-slate-400 sm:hidden font-medium">Invoice Amount</span>
                    <p className={clsx('text-xl font-bold', getAmountColor(inv.status))}>
                      {formatCurrency(inv.amount)}
                    </p>
                  </div>
 
                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-start">
                    <Button variant="ghost" size="sm" onClick={() => setViewInvoice(inv)} title="View Invoice">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingInvoice(inv)} title="Edit Invoice">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteInvoice(inv.id)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      title="Delete Invoice"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {inv.status !== 'paid' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => markAsPaid(inv.id)}
                        >
                          <Banknote className="h-3.5 w-3.5 mr-1" />
                          Mark Paid
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendReminder(inv.id)}
                          className={sentReminders.has(inv.id) ? 'opacity-50 pointer-events-none' : ''}
                        >
                          <Send className="h-3.5 w-3.5 mr-1" />
                          Remind
                        </Button>
                      </>
                    )}
                  </div>
                </div>   </div>
              </div>

              {/* Payment automation badge */}
              {inv.status !== 'paid' && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => showToast(`Razorpay checkout link generated for ${inv.leadName} (Simulated)`, 'info')}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-full px-2.5 py-1 cursor-pointer transition-all"
                  >
                    <CreditCard className="h-3 w-3" />
                    Razorpay
                    <span className="text-[10px] bg-indigo-100 text-indigo-600 rounded px-1">Demo Mode</span>
                  </button>
                  <button
                    onClick={() => showToast(`Stripe payment intent created for ${inv.leadName} (Simulated)`, 'info')}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-full px-2.5 py-1 cursor-pointer transition-all"
                  >
                    <CreditCard className="h-3 w-3" />
                    Stripe
                    <span className="text-[10px] bg-indigo-100 text-indigo-600 rounded px-1">Demo Mode</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Invoice Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Create Invoice">
        <InvoiceForm
          onSubmit={handleNewInvoice}
          onClose={() => setIsFormOpen(false)}
          nextInvoiceNumber={nextInvoiceNum}
        />
      </Modal>

      {/* Edit Invoice Modal */}
      <Modal isOpen={!!editingInvoice} onClose={() => setEditingInvoice(null)} title="Edit Invoice">
        {editingInvoice && (
          <InvoiceForm
            onSubmit={handleEditInvoiceSubmit}
            onClose={() => setEditingInvoice(null)}
            invoiceToEdit={editingInvoice}
          />
        )}
      </Modal>

      {/* View Invoice Modal */}
      <Modal
        isOpen={!!viewInvoice}
        onClose={() => setViewInvoice(null)}
        title={`Invoice ${viewInvoice?.invoiceNumber || ''}`}
      >
        {viewInvoice && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Client</span>
                <span className="text-sm font-medium text-slate-900">{viewInvoice.leadName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Phone</span>
                <span className="text-sm font-medium text-slate-900">{viewInvoice.leadPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Service</span>
                <span className="text-sm font-medium text-slate-900">{viewInvoice.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Amount</span>
                <span className="text-sm font-bold text-slate-900">{formatCurrency(viewInvoice.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <Badge className={getInvoiceStatusColor(viewInvoice.status)}>
                  {getStatusLabel(viewInvoice.status)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Due Date</span>
                <span className="text-sm font-medium text-slate-900">{formatDate(viewInvoice.dueDate)}</span>
              </div>
              {viewInvoice.paidAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Paid At</span>
                  <span className="text-sm font-medium text-emerald-600">{formatDate(viewInvoice.paidAt)}</span>
                </div>
              )}
              {viewInvoice.notes && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-sm text-slate-500">Notes</span>
                  <p className="text-sm text-slate-700 mt-1">{viewInvoice.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setViewInvoice(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
