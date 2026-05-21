'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Flame,
  Clock,
  Calendar,
  IndianRupee,
  Brain,
  Sparkles,
  ArrowRight,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import clsx from 'clsx';

import Card, { StatCard } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';

import { mockDashboardStats, mockAIReport, mockLeads, mockAppointments } from '@/lib/mock-data';
import { formatCurrency, timeAgo, formatTime, getLeadStatusColor, getScoreColor, getGreeting } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

// ── Revenue Chart Data (hardcoded for CSS chart) ──────────────────
const revenueData = [
  { month: 'Jan', value: 45000, label: '₹45K' },
  { month: 'Feb', value: 52000, label: '₹52K' },
  { month: 'Mar', value: 48000, label: '₹48K' },
  { month: 'Apr', value: 61000, label: '₹61K' },
  { month: 'May', value: 12000, label: '₹12K' },
];
const maxRevenue = Math.max(...revenueData.map((d) => d.value));

// ── Action Icons Mapping ──────────────────────────────────────────
function getActionIcon(action: string) {
  if (action.includes('🔥')) return <Flame className="h-4 w-4 text-orange-500 flex-shrink-0" />;
  if (action.includes('📞')) return <span className="text-sm flex-shrink-0">📞</span>;
  if (action.includes('💰')) return <span className="text-sm flex-shrink-0">💰</span>;
  if (action.includes('📅')) return <span className="text-sm flex-shrink-0">📅</span>;
  if (action.includes('📱')) return <span className="text-sm flex-shrink-0">📱</span>;
  if (action.includes('🎯')) return <span className="text-sm flex-shrink-0">🎯</span>;
  return <ChevronRight className="h-4 w-4 text-indigo-400 flex-shrink-0" />;
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => setMounted(true), []);

  const stats = mockDashboardStats;
  const report = mockAIReport;
  const recentLeads = [...mockLeads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  // Filter appointments for "today" — we use the first few appointments from mock data
  const todaysAppointments = mockAppointments.filter((a) => a.date === '2026-05-21');
  const upcomingAppointments = todaysAppointments.length > 0 ? todaysAppointments : mockAppointments.slice(0, 3);

  const scoreColor = stats.aiBusinessScore >= 80 ? 'text-emerald-600' : stats.aiBusinessScore >= 60 ? 'text-amber-600' : 'text-rose-600';

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{getGreeting()}, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
        <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening with your business today.</p>
      </div>

      {/* ── Stats Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<Users className="h-5 w-5 text-indigo-600" />}
          label="Total Leads"
          value={String(stats.totalLeads)}
          trend="+3 today"
          trendUp
        />
        <StatCard
          icon={<Flame className="h-5 w-5 text-orange-500" />}
          label="Hot Leads"
          value={String(stats.hotLeads)}
          trend="🔥"
          trendUp
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          label="Pending Follow-ups"
          value={String(stats.pendingFollowUps)}
          trend="Action needed"
        />
        <StatCard
          icon={<Calendar className="h-5 w-5 text-blue-500" />}
          label="Today's Appointments"
          value={String(stats.todaysAppointments)}
        />
        <StatCard
          icon={<IndianRupee className="h-5 w-5 text-emerald-600" />}
          label="Revenue Collected"
          value={formatCurrency(stats.revenueCollected)}
          trend="+₹12K this month"
          trendUp
        />
        <StatCard
          icon={<Brain className="h-5 w-5 text-indigo-600" />}
          label="AI Business Score"
          value={`${stats.aiBusinessScore}/100`}
          className={scoreColor}
        />
      </div>

      {/* ── AI Daily Summary Card ────────────────────── */}
      <div className="relative rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-white via-indigo-50/40 to-blue-50/60 p-6 shadow-sm overflow-hidden">
        {/* Decorative gradient circles */}
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-indigo-100/50 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-blue-100/50 blur-2xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-100">
              <Sparkles className="h-4.5 w-4.5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">AI Daily Insights</h2>
            <Badge className="bg-indigo-100 text-indigo-700 text-xs">Auto-generated</Badge>
          </div>

          <p className="text-slate-600 leading-relaxed mb-4">{report.summary}</p>

          <div className="space-y-2 mb-4">
            {report.suggestedActions.slice(0, 3).map((action, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-lg bg-white/70 backdrop-blur-sm border border-slate-100 px-4 py-3 transition-colors hover:bg-white">
                {getActionIcon(action)}
                <span className="text-sm text-slate-700">{action}</span>
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/reports"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            View Full Report <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ── Two‑Column Layout ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Recent Leads ────────────────────────────── */}
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Recent Leads</h3>
            <Link href="/dashboard/leads" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-50">
            {recentLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/dashboard/leads/${lead.id}`}
                className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50/80 transition-colors group"
              >
                <Avatar name={lead.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                    {lead.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{lead.serviceInterested || 'No service'}</p>
                </div>
                <Badge className={clsx('text-xs', getLeadStatusColor(lead.status))}>
                  {lead.status}
                </Badge>
                <span className={clsx('text-sm font-semibold tabular-nums', getScoreColor(lead.score))}>
                  {lead.score}
                </span>
                <span className="text-xs text-slate-400 hidden sm:block">{timeAgo(lead.updatedAt)}</span>
              </Link>
            ))}
          </div>
        </Card>

        {/* ── Upcoming Appointments ──────────────────── */}
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Today&apos;s Schedule</h3>
            <Link href="/dashboard/appointments" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<Calendar className="h-10 w-10 text-slate-300" />}
                title="No appointments today"
                description="Your schedule is clear. Book some demos!"
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/80 transition-colors">
                  <div className="flex flex-col items-center min-w-[52px]">
                    <span className="text-sm font-semibold text-indigo-600">{formatTime(apt.time)}</span>
                    <span className="text-[10px] text-slate-400">{apt.duration}min</span>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{apt.leadName}</p>
                    <p className="text-xs text-slate-400 truncate">{apt.service}</p>
                  </div>
                  <Badge className={clsx(
                    'text-xs capitalize',
                    apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                    apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    apt.status === 'completed' ? 'bg-slate-100 text-slate-600' :
                    'bg-rose-100 text-rose-700'
                  )}>
                    {apt.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Revenue Overview ─────────────────────────── */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-slate-900">Revenue Overview</h3>
            <p className="text-sm text-slate-400 mt-0.5">Last 5 months</p>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
            <TrendingUp className="h-4 w-4" />
            +18% overall
          </div>
        </div>

        <div className={clsx(
          'flex items-end justify-between gap-3 sm:gap-6 h-48',
          !mounted && 'opacity-0'
        )}>
          {revenueData.map((d, idx) => {
            const heightPercent = (d.value / maxRevenue) * 100;
            return (
              <div key={d.month} className="flex flex-col items-center flex-1 h-full justify-end">
                <span className="text-xs font-semibold text-slate-600 mb-1.5">{d.label}</span>
                <div
                  className={clsx(
                    'w-full max-w-[56px] rounded-t-lg bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all duration-700 ease-out relative group cursor-default',
                    mounted ? 'opacity-100' : 'opacity-0'
                  )}
                  style={{
                    height: mounted ? `${heightPercent}%` : '0%',
                    transitionDelay: `${idx * 100}ms`,
                  }}
                >
                  {/* Hover tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {formatCurrency(d.value)}
                  </div>
                  {/* Shine effect */}
                  <div className="absolute inset-0 rounded-t-lg bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
                <span className="text-xs text-slate-500 mt-2 font-medium">{d.month}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
