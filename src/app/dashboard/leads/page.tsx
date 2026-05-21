'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Upload,
  Search,
  Eye,
  Phone,
  MessageSquare,
  CheckCircle,
  Users,
} from 'lucide-react';
import clsx from 'clsx';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import LeadForm from '@/components/forms/LeadForm';

import { mockLeads } from '@/lib/mock-data';
import { LEAD_STATUSES, LEAD_SOURCES } from '@/lib/constants';
import { timeAgo, getLeadStatusColor, getScoreColor, generateId } from '@/lib/utils';
import { type Lead, type LeadStatus, type LeadSource } from '@/lib/types';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(() =>
    [...mockLeads].sort((a, b) => b.score - a.score)
  );
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'all'>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // ── Filtered leads ────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = leads;
    if (statusFilter !== 'all') list = list.filter((l) => l.status === statusFilter);
    if (sourceFilter !== 'all') list = list.filter((l) => l.source === sourceFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          (l.serviceInterested ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [leads, statusFilter, sourceFilter, search]);

  // ── Add Lead handler ──────────────────────────────────────
  function handleAddLead(data: Partial<Lead>) {
    const newLead: Lead = {
      id: `lead-${generateId()}`,
      name: data.name ?? '',
      phone: data.phone ?? '',
      email: data.email,
      status: data.status ?? 'new',
      source: data.source ?? 'manual',
      score: Math.floor(Math.random() * 40) + 40,
      notes: data.notes ?? '',
      serviceInterested: data.serviceInterested,
      activities: [
        {
          id: `act-${generateId()}`,
          leadId: '',
          type: 'created',
          description: 'Lead created manually',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newLead.activities[0].leadId = newLead.id;
    setLeads((prev) => [newLead, ...prev]);
    setModalOpen(false);
    showToast('Lead added successfully! 🎉');
  }

  // ── Import CSV (mock) ────────────────────────────────────
  function handleImportCSV() {
    showToast('CSV import started — 8 leads imported successfully! ✅');
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  // ── Source emoji helper ───────────────────────────────────
  function sourceEmoji(source: LeadSource) {
    return LEAD_SOURCES.find((s) => s.value === source)?.icon ?? '📋';
  }

  return (
    <div className="space-y-6">
      {/* ── Toast ─────────────────────────────────────── */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle className="h-4 w-4" />
          {toast}
        </div>
      )}

      {/* ── Header ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lead CRM</h1>
          <p className="text-slate-500 mt-0.5">Manage and track all your leads in one place.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleImportCSV}>
            <Upload className="h-4 w-4 mr-1.5" />
            Import CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────── */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads by name, phone, or service..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter((e.target as HTMLSelectElement).value as LeadStatus | 'all')}
            options={[
              { value: 'all', label: 'All Statuses' },
              ...LEAD_STATUSES.map((s) => ({ value: s.value, label: s.label })),
            ]}
          />
          <Select
            value={sourceFilter}
            onChange={(e) => setSourceFilter((e.target as HTMLSelectElement).value as LeadSource | 'all')}
            options={[
              { value: 'all', label: 'All Sources' },
              ...LEAD_SOURCES.map((s) => ({ value: s.value, label: `${s.icon} ${s.label}` })),
            ]}
          />
        </div>
      </Card>

      {/* ── Lead Count ────────────────────────────────── */}
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{filtered.length}</span> of{' '}
        <span className="font-medium text-slate-700">{leads.length}</span> leads
      </p>

      {/* ── Leads Table ───────────────────────────────── */}
      {filtered.length === 0 ? (
        <Card className="p-10">
          <EmptyState
            icon={<Users className="h-12 w-12 text-slate-300" />}
            title="No leads found"
            description="Try adjusting your filters or add a new lead."
            action={
              <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" /> Add Lead
              </Button>
            }
          />
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead className="hidden md:table-cell">Service</TableHead>
                  <TableHead className="hidden sm:table-cell">Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>AI Score</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lead) => (
                  <TableRow key={lead.id} className="group">
                    <TableCell>
                      <Link href={`/dashboard/leads/${lead.id}`} className="flex items-center gap-3 min-w-0">
                        <Avatar name={lead.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {lead.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{lead.phone}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-slate-600">{lead.serviceInterested || '—'}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm">
                        {sourceEmoji(lead.source)}{' '}
                        <span className="text-slate-600 capitalize">{lead.source}</span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={clsx('text-xs capitalize', getLeadStatusColor(lead.status))}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={clsx('text-sm font-bold tabular-nums', getScoreColor(lead.score))}>
                        {lead.score}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-slate-400">
                        {lead.lastContactedAt ? timeAgo(lead.lastContactedAt) : 'Never'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/dashboard/leads/${lead.id}`}
                          className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Call"
                        >
                          <Phone className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Message"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* ── Add Lead Modal ────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Lead">
        <LeadForm onSubmit={handleAddLead} onClose={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
