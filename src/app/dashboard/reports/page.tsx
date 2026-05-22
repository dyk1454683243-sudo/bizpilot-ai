'use client';

import { useState, useEffect } from 'react';
import {
  Brain,
  Calendar,
  Flame,
  AlertTriangle,
  CheckSquare,
  Square,
  TrendingUp,
  Users,
  Clock,
  IndianRupee,
  Sparkles,
  Info,
  CheckCircle,
  ArrowUpRight,
  Star,
  RefreshCw,
} from 'lucide-react';
import clsx from 'clsx';

import Card, { StatCard } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/contexts/ToastContext';

import { formatCurrency, formatDate } from '@/lib/utils';
import { fetchLeads } from '@/lib/leads-db';
import { fetchAppointments } from '@/lib/appointments-db';
import { fetchInvoices } from '@/lib/invoices-db';
import { fetchReviews } from '@/lib/reviews-db';
import { generateRealTimeReport, type ComputedReport } from '@/lib/reports-helpers';

export default function ReportsPage() {
  const { showToast } = useToast();

  const [report, setReport] = useState<ComputedReport | null>(null);
  const [checkedActions, setCheckedActions] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      // Fetch all collections in parallel using the RLS-secure helper layers
      const [leads, appointments, invoices, reviews] = await Promise.all([
        fetchLeads(),
        fetchAppointments(),
        fetchInvoices(),
        fetchReviews(),
      ]);

      // Calculate the report metrics dynamically
      const computedReport = generateRealTimeReport(leads, appointments, invoices, reviews);
      setReport(computedReport);
    } catch (err: any) {
      console.error('Failed to load reports data:', err);
      setError(err.message || 'An error occurred while generating the report. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function toggleAction(idx: number, actionText: string) {
    setCheckedActions((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
        showToast(`Action completed: "${actionText}"`, 'success');
      }
      return next;
    });
  }

  // Alert icon & color
  function alertStyle(type: 'warning' | 'success' | 'info') {
    if (type === 'warning') return { bg: 'bg-amber-50 border-amber-200', icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, text: 'text-amber-800' };
    if (type === 'success') return { bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle className="h-4 w-4 text-emerald-500" />, text: 'text-emerald-800' };
    return { bg: 'bg-blue-50 border-blue-200', icon: <Info className="h-4 w-4 text-blue-500" />, text: 'text-blue-800' };
  }

  // ── Render Loading Skeleton ─────────────────────────
  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 rounded-lg" />
            <div className="h-4 w-48 bg-slate-100 rounded-lg" />
          </div>
          <div className="h-10 w-36 bg-slate-200 rounded-lg" />
        </div>

        {/* Summary Card Skeleton */}
        <div className="h-32 bg-slate-100 rounded-xl border border-slate-200" />

        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl border border-slate-200" />
          ))}
        </div>

        {/* Hot Leads Skeleton */}
        <div className="h-28 bg-slate-100 rounded-xl border border-slate-200" />
      </div>
    );
  }

  // ── Render Error State ──────────────────────────────
  if (error) {
    return (
      <Card className="p-8 border-rose-200 bg-rose-50/40 text-center max-w-xl mx-auto mt-12">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-rose-500" />
        </div>
        <h3 className="text-lg font-semibold text-rose-900 mb-2">Failed to Generate Report</h3>
        <p className="text-sm text-rose-700 mb-6">{error}</p>
        <button
          onClick={loadData}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Generating Report
        </button>
      </Card>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-8">
      {/* ── Header ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-indigo-100">
              <Brain className="h-5 w-5 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">AI Daily Business Report</h1>
          </div>
          <p className="text-slate-500 mt-1.5 ml-[46px]">
            Smart insights to grow your business
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 shadow-sm">
          <Calendar className="h-4 w-4 text-slate-400" />
          {formatDate(report.date)}
        </div>
      </div>

      {/* ── Report Summary Card ──────────────────────── */}
      <div className="relative rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-white via-indigo-50/30 to-blue-50/50 p-6 shadow-sm overflow-hidden">
        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-indigo-100/40 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-blue-100/40 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Daily Summary — {formatDate(report.date)}
            </h2>
            <Badge className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
              <Sparkles className="h-3 w-3 mr-1 inline animate-pulse" /> AI Synthesized
            </Badge>
          </div>
          <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">{report.summary}</p>
        </div>
      </div>

      {/* ── Metrics Grid ─────────────────────────────── */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Real-Time Business Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <StatCard
            icon={<Users className="h-5 w-5 text-indigo-600" />}
            label="Total Leads"
            value={String(report.totalLeads)}
          />
          <StatCard
            icon={<Flame className="h-5 w-5 text-orange-500" />}
            label="Hot Leads"
            value={String(report.hotLeadsCount)}
          />
          <StatCard
            icon={<Clock className="h-5 w-5 text-amber-500" />}
            label="Follow-ups Needed"
            value={String(report.followUpsNeeded)}
          />
          <StatCard
            icon={<Calendar className="h-5 w-5 text-emerald-600" />}
            label="Appointments Confirmed"
            value={String(report.appointmentsConfirmed)}
          />
          <StatCard
            icon={<Clock className="h-5 w-5 text-indigo-500" />}
            label="Appointments Pending"
            value={String(report.appointmentsPending)}
          />
          <StatCard
            icon={<IndianRupee className="h-5 w-5 text-emerald-600" />}
            label="Revenue Collected"
            value={formatCurrency(report.revenueCollected)}
          />
          <StatCard
            icon={<IndianRupee className="h-5 w-5 text-rose-500" />}
            label="Missed (Unpaid) Revenue"
            value={formatCurrency(report.missedRevenue)}
          />
          <StatCard
            icon={<Star className="h-5 w-5 text-amber-500" />}
            label="Average Rating"
            value={report.averageRating > 0 ? `${report.averageRating} / 5` : 'N/A'}
          />
          <StatCard
            icon={<CheckCircle className="h-5 w-5 text-teal-600" />}
            label="Reviews Complete / Req"
            value={`${report.reviewsCompleted} / ${report.reviewsPending}`}
            className="col-span-2 md:col-span-1"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-indigo-600" />}
            label="Conversion Rate"
            value={`${report.conversionRate}%`}
          />
        </div>
      </div>

      {/* ── Hot Leads ────────────────────────────────── */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" /> Hot Leads to Target
        </h3>
        {report.hotLeadsList.length === 0 ? (
          <p className="text-sm text-slate-500">No active hot leads right now. Change a lead's status to Hot in CRM to prioritize them.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {report.hotLeadsList.map((name, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-lg border border-orange-100 bg-orange-50/50 px-4 py-3 hover:bg-orange-50 transition-colors"
              >
                <span className="text-lg">🔥</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{name}</p>
                  <p className="text-xs text-slate-500">High conversion probability</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-orange-400 ml-auto" />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Suggested Actions ────────────────────────── */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-indigo-500" /> Action Checklist
        </h3>
        <div className="space-y-2">
          {report.suggestedActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => toggleAction(idx, action)}
              className={clsx(
                'w-full flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-all',
                checkedActions.has(idx)
                  ? 'bg-emerald-50/50 border-emerald-200 line-through decoration-slate-300'
                  : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30'
              )}
            >
              <span className="mt-0.5 flex-shrink-0 text-indigo-600 font-bold text-sm w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                {checkedActions.has(idx) ? (
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Square className="h-3.5 w-3.5" />
                )}
              </span>
              <span className={clsx('text-sm', checkedActions.has(idx) ? 'text-slate-400' : 'text-slate-700')}>
                {action}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* ── Missed Opportunities ─────────────────────── */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" /> Missed Opportunities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {report.missedOpportunities.map((op, idx) => (
            <Card key={idx} className="p-5 border-amber-200 bg-amber-50/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <h4 className="text-sm font-semibold text-slate-900">{op.leadName}</h4>
                </div>
                <p className="text-xs text-slate-600 mb-3">{op.reason}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-sm font-semibold text-amber-700 mb-3">
                  <IndianRupee className="h-3.5 w-3.5" />
                  {formatCurrency(op.potentialRevenue)}
                  <span className="text-xs font-normal text-slate-500 ml-1">potential value</span>
                </div>
                <div className="p-2.5 rounded-md bg-white border border-amber-100">
                  <p className="text-xs text-slate-600">💡 {op.action}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ── AI Insights & Alerts ─────────────────────── */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" /> AI Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.insights.map((insight, idx) => (
            <Card key={idx} className="p-4 border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
              <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Alerts ───────────────────────────────────── */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-500" /> Actionable Alerts
        </h3>
        <div className="space-y-3">
          {report.alerts.map((alert, idx) => {
            const style = alertStyle(alert.type);
            return (
              <div
                key={idx}
                className={clsx('flex items-start gap-3 rounded-lg border p-4 shadow-sm transition-all', style.bg)}
              >
                {style.icon}
                <p className={clsx('text-sm', style.text)}>{alert.message}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
