'use client';

import React, { useState } from 'react';
import Card, { StatCard } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { PRICING_PLANS } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { mockBusiness } from '@/lib/mock-data';
import {
  CreditCard,
  Zap,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Download,
} from 'lucide-react';

interface BillingHistoryItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
}

export default function BillingPage() {
  const { user } = useAuth();
  
  // State to simulate switching or upgrading plans
  const [currentPlanName, setCurrentPlanName] = useState('Pro');

  const billingHistory: BillingHistoryItem[] = [
    { id: 'INV-004', date: '2026-05-15', description: 'BizPilot AI Pro Plan Subscription', amount: 999, status: 'paid' },
    { id: 'INV-003', date: '2026-04-15', description: 'BizPilot AI Pro Plan Subscription', amount: 999, status: 'paid' },
    { id: 'INV-002', date: '2026-03-15', description: 'BizPilot AI Pro Plan Subscription', amount: 999, status: 'paid' },
    { id: 'INV-001', date: '2026-02-15', description: 'BizPilot AI Pro Plan Subscription', amount: 999, status: 'paid' },
  ];

  const handlePlanChange = (planName: string) => {
    setCurrentPlanName(planName);
  };

  const getStatusBadge = (status: 'paid' | 'pending' | 'failed') => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-100 text-emerald-700">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-rose-100 text-rose-700">Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-indigo-600" />
          Billing & Subscription
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your subscription plans, payment methods, and invoice history
        </p>
      </div>

      {/* ── Current Plan Summary ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2 border-indigo-150 bg-gradient-to-br from-white via-indigo-50/10 to-blue-50/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-600 text-white font-bold text-xs uppercase px-2.5 py-1">
                  Active
                </Badge>
                {currentPlanName === 'Pro' && (
                  <Badge className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                    <Sparkles className="h-3 w-3 mr-1 inline" /> Popular
                  </Badge>
                )}
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-3">
                {currentPlanName} Plan
              </h2>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Unlock automated follow-ups, lead scoring, appointments tracking, and daily reports.
              </p>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <span className="text-3xl font-extrabold text-slate-900">
                {currentPlanName === 'Free' ? '₹0' : currentPlanName === 'Pro' ? '₹999' : '₹2,999'}
              </span>
              <span className="text-slate-500 text-sm">/month</span>
              <p className="text-xs text-slate-400 mt-1">Next renewal: June 15, 2026</p>
            </div>
          </div>

          <div className="border-t border-slate-100 mt-6 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Billing period: Monthly</span>
              <span className="text-slate-300">|</span>
              <CreditCard className="h-4 w-4 text-slate-400" />
              <span>UPI ID: {mockBusiness.upiId || 'deshraj@upi'}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Cancel Plan
              </Button>
              <Button variant="primary" size="sm">
                Change Payment Method
              </Button>
            </div>
          </div>
        </Card>

        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-indigo-600" />}
          label="AI Credits Usage"
          value="84 / Unlimited"
          trend="Resets in 25 days"
          className="bg-white"
        />
      </div>

      {/* ── Plans Upgrade Comparator ──────────────────── */}
      <div>
        <h3 className="font-bold text-slate-900 text-lg mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_PLANS.map((plan) => {
            const isActive = currentPlanName === plan.name;
            return (
              <Card
                key={plan.name}
                className={`p-6 flex flex-col justify-between transition-all duration-300 ${
                  isActive ? 'ring-2 ring-indigo-600 border-indigo-600' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-slate-900">{plan.name}</h4>
                    {isActive && (
                      <Badge className="bg-indigo-100 text-indigo-700 font-semibold text-xs">
                        Current Plan
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 min-h-[32px]">{plan.description}</p>
                  
                  <div className="mt-4">
                    <span className="text-3xl font-extrabold text-slate-900">{plan.priceLabel}</span>
                    <span className="text-slate-500 text-sm">{plan.period}</span>
                  </div>

                  <ul className="space-y-2 mt-6">
                    {plan.features.slice(0, 5).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Button
                    variant={isActive ? 'outline' : 'primary'}
                    className="w-full"
                    size="sm"
                    disabled={isActive}
                    onClick={() => handlePlanChange(plan.name)}
                  >
                    {isActive ? 'Current Plan' : `Upgrade to ${plan.name}`}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Billing History List ─────────────────────── */}
      <div>
        <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-slate-600" />
          Billing History
        </h3>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-5 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Invoice ID</span>
            <span>Billing Date</span>
            <span className="col-span-2">Description</span>
            <span>Amount</span>
            <span className="text-right">Status</span>
          </div>

          {/* List */}
          <div className="divide-y divide-slate-100">
            {billingHistory.map((invoice) => (
              <div
                key={invoice.id}
                className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-4 px-5 py-4 items-center hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <span className="text-xs font-bold text-indigo-600">{invoice.id}</span>
                  <span className="sm:hidden text-xs text-slate-500">{formatDate(invoice.date)}</span>
                </div>
                <span className="hidden sm:inline text-xs text-slate-600">
                  {formatDate(invoice.date)}
                </span>
                <span className="text-xs text-slate-700 font-medium col-span-1 sm:col-span-2">
                  {invoice.description}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {formatCurrency(invoice.amount)}
                </span>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  {getStatusBadge(invoice.status)}
                  <button
                    title="Download Invoice"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
