'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Edit,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  CreditCard,
  Star,
  Zap,
  Send,
  Plus,
} from 'lucide-react';
import clsx from 'clsx';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';

import { mockLeads } from '@/lib/mock-data';
import {
  formatDate,
  timeAgo,
  getLeadStatusColor,
  getScoreColor,
  getScoreGradient,
} from '@/lib/utils';
import { scoreLead, suggestNextAction } from '@/lib/mock-ai';
import type { Lead, LeadActivity } from '@/lib/types';

// ── Activity Icon Mapping ──────────────────────────────────
function getActivityIcon(type: LeadActivity['type']) {
  const iconMap: Record<string, React.ReactNode> = {
    created: <Plus className="h-3.5 w-3.5 text-indigo-500" />,
    contacted: <Phone className="h-3.5 w-3.5 text-blue-500" />,
    note_added: <FileText className="h-3.5 w-3.5 text-slate-500" />,
    status_changed: <Zap className="h-3.5 w-3.5 text-amber-500" />,
    follow_up_scheduled: <Clock className="h-3.5 w-3.5 text-indigo-500" />,
    appointment_booked: <Calendar className="h-3.5 w-3.5 text-emerald-500" />,
    invoice_sent: <CreditCard className="h-3.5 w-3.5 text-blue-500" />,
    payment_received: <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />,
    review_requested: <Star className="h-3.5 w-3.5 text-amber-500" />,
    ai_message_generated: <Sparkles className="h-3.5 w-3.5 text-indigo-500" />,
  };
  return iconMap[type] ?? <AlertCircle className="h-3.5 w-3.5 text-slate-400" />;
}

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = params?.id as string;
  const lead = mockLeads.find((l) => l.id === leadId);

  const [scoreData, setScoreData] = useState<{ score: number; factors: string[]; recommendation: string } | null>(null);
  const [nextAction, setNextAction] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [localNotes, setLocalNotes] = useState<string[]>([]);
  const [loadingScore, setLoadingScore] = useState(true);
  const [loadingAction, setLoadingAction] = useState(true);

  const loadData = useCallback(async () => {
    if (!lead) return;
    setLoadingScore(true);
    setLoadingAction(true);
    const [s, a] = await Promise.all([scoreLead(lead), suggestNextAction(lead)]);
    setScoreData(s);
    setNextAction(a);
    setLoadingScore(false);
    setLoadingAction(false);
  }, [lead]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!lead) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={<AlertCircle className="h-12 w-12 text-slate-300" />}
          title="Lead not found"
          description="This lead doesn't exist or has been removed."
          action={
            <Link href="/dashboard/leads">
              <Button variant="primary" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Leads
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const displayScore = scoreData?.score ?? lead.score;
  const scorePercent = (displayScore / 100) * 360;

  function handleAddNote() {
    if (!newNote.trim()) return;
    setLocalNotes((prev) => [newNote.trim(), ...prev]);
    setNewNote('');
  }

  const sortedActivities = [...lead.activities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      {/* ── Back Link ─────────────────────────────────── */}
      <Link
        href="/dashboard/leads"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Leads
      </Link>

      {/* ── Two‑Column Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══ LEFT COLUMN (2/3) ═══════════════════════ */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Contact Card ─────────────────────────── */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <Avatar name={lead.name} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900">{lead.name}</h1>
                  <Badge className={clsx('text-xs capitalize', getLeadStatusColor(lead.status))}>
                    {lead.status}
                  </Badge>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" /> {lead.phone}
                  </p>
                  {lead.email && (
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400" /> {lead.email}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge className="bg-slate-100 text-slate-600 text-xs capitalize">
                    {lead.source}
                  </Badge>
                  {lead.serviceInterested && (
                    <Badge className="bg-indigo-50 text-indigo-600 text-xs">
                      {lead.serviceInterested}
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1.5" /> Edit
              </Button>
            </div>
          </Card>

          {/* ── AI Lead Score Card ────────────────────── */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-indigo-500" /> AI Lead Score
            </h3>
            {loadingScore ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-8 w-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Score Gauge */}
                <div className="relative flex-shrink-0">
                  <div
                    className="h-32 w-32 rounded-full flex items-center justify-center"
                    style={{
                      background: `conic-gradient(${
                        displayScore >= 80
                          ? '#10b981'
                          : displayScore >= 60
                          ? '#f59e0b'
                          : displayScore >= 40
                          ? '#f97316'
                          : '#ef4444'
                      } ${scorePercent}deg, #e2e8f0 ${scorePercent}deg)`,
                    }}
                  >
                    <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center">
                      <span className={clsx('text-3xl font-bold', getScoreColor(displayScore))}>
                        {displayScore}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scoring Factors */}
                <div className="flex-1 space-y-2">
                  {scoreData?.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-600">{factor}</span>
                    </div>
                  ))}
                  {scoreData?.recommendation && (
                    <div className="mt-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                      <p className="text-sm text-indigo-700">{scoreData.recommendation}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* ── Activity Timeline ────────────────────── */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Activity Timeline</h3>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200" />

              <div className="space-y-4">
                {sortedActivities.map((activity) => (
                  <div key={activity.id} className="relative flex gap-4 pl-0">
                    {/* Icon dot */}
                    <div className="relative z-10 flex-shrink-0 h-8 w-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <p className="text-sm text-slate-700">{activity.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{timeAgo(activity.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* ── Notes Section ────────────────────────── */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Notes</h3>
            {lead.notes && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 mb-4">
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{lead.notes}</p>
              </div>
            )}
            {/* Local notes */}
            {localNotes.map((note, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-blue-50 border border-blue-100 mb-3">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{note}</p>
                <p className="text-xs text-slate-400 mt-1">Just now</p>
              </div>
            ))}
            {/* Add note */}
            <div className="flex gap-2">
              <textarea
                className="flex-1 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow resize-none"
                rows={2}
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <Button variant="primary" size="sm" onClick={handleAddNote} className="self-end">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* ═══ RIGHT COLUMN (1/3) ══════════════════════ */}
        <div className="space-y-6">
          {/* ── AI Suggested Action ───────────────────── */}
          <Card className="p-5 border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-blue-50/40">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <h3 className="font-semibold text-indigo-900 text-sm">AI Suggested Action</h3>
            </div>
            {loadingAction ? (
              <div className="flex items-center gap-2 py-3">
                <div className="h-5 w-5 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
                <span className="text-sm text-indigo-600">Analyzing lead…</span>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-700 leading-relaxed mb-4">{nextAction}</p>
                <Button variant="primary" size="sm" className="w-full">
                  Take Action
                </Button>
              </>
            )}
          </Card>

          {/* ── Quick Actions ────────────────────────── */}
          <Card className="p-5">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2 text-emerald-500" /> Call
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2 text-green-500" /> WhatsApp
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2 text-blue-500" /> Email
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2 text-indigo-500" /> Book Appointment
              </Button>
            </div>
          </Card>

          {/* ── Lead Info ────────────────────────────── */}
          <Card className="p-5">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">Lead Info</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-slate-400 uppercase tracking-wider">Created</dt>
                <dd className="text-sm text-slate-700 mt-0.5">{formatDate(lead.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400 uppercase tracking-wider">Last Contacted</dt>
                <dd className="text-sm text-slate-700 mt-0.5">
                  {lead.lastContactedAt ? timeAgo(lead.lastContactedAt) : 'Never'}
                </dd>
              </div>
              {lead.nextFollowUpAt && (
                <div>
                  <dt className="text-xs text-slate-400 uppercase tracking-wider">Next Follow-up</dt>
                  <dd className="text-sm text-slate-700 mt-0.5">{formatDate(lead.nextFollowUpAt)}</dd>
                </div>
              )}
              {lead.serviceInterested && (
                <div>
                  <dt className="text-xs text-slate-400 uppercase tracking-wider">Service Interested</dt>
                  <dd className="text-sm text-slate-700 mt-0.5">{lead.serviceInterested}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-slate-400 uppercase tracking-wider">Lead Score</dt>
                <dd className="mt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={clsx('h-full rounded-full bg-gradient-to-r', getScoreGradient(displayScore))}
                        style={{ width: `${displayScore}%` }}
                      />
                    </div>
                    <span className={clsx('text-sm font-bold', getScoreColor(displayScore))}>
                      {displayScore}
                    </span>
                  </div>
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
