'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Zap, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { PRICING_PLANS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

export default function SimpleBillingPage() {
  const [currentPlan, setCurrentPlan] = useState('Pro');

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation back to dashboard */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <span className="text-xl font-bold uppercase tracking-wider text-slate-800">
            <span className="text-indigo-600">Biz</span>Pilot AI
          </span>
        </div>

        {/* Header section */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center justify-center gap-2">
            <CreditCard className="h-8 w-8 text-indigo-600" />
            Subscription & Billing
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Manage your billing cycle, payment methods, and pricing plans.
          </p>
        </div>

        {/* Current Plan Overview */}
        <Card className="p-6 border-indigo-150 bg-gradient-to-br from-white via-indigo-50/10 to-blue-50/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-600 text-white font-bold text-xs uppercase px-2.5 py-1">
                  Active
                </Badge>
                {currentPlan === 'Pro' && (
                  <Badge className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                    <Zap className="h-3 w-3 mr-1 inline animate-bounce" /> Popular Choice
                  </Badge>
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mt-3">
                {currentPlan} Plan
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Your account is active. Upgrades take effect immediately.
              </p>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <span className="text-3xl font-extrabold text-slate-900">
                {currentPlan === 'Free' ? '₹0' : currentPlan === 'Pro' ? '₹999' : '₹2,999'}
              </span>
              <span className="text-slate-500 text-sm">/month</span>
              <p className="text-xs text-slate-400 mt-1">Renewal date: June 15, 2026</p>
            </div>
          </div>
        </Card>

        {/* Pricing tier selection */}
        <div>
          <h3 className="font-bold text-slate-800 text-lg mb-4 text-center sm:text-left">
            Change or Upgrade Plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_PLANS.map((plan) => {
              const isActive = currentPlan === plan.name;
              return (
                <Card
                  key={plan.name}
                  className={`p-6 flex flex-col justify-between transition-all duration-300 ${
                    isActive ? 'ring-2 ring-indigo-600 border-indigo-600 shadow-md' : 'hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-slate-900">{plan.name}</h4>
                      {isActive && (
                        <Badge className="bg-indigo-100 text-indigo-700 font-semibold text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2 min-h-[32px]">
                      {plan.description}
                    </p>
                    
                    <div className="mt-4">
                      <span className="text-3xl font-extrabold text-slate-900">
                        {plan.priceLabel}
                      </span>
                      <span className="text-slate-500 text-sm">{plan.period}</span>
                    </div>

                    <ul className="space-y-2 mt-6">
                      {plan.features.slice(0, 4).map((feature, idx) => (
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
                      onClick={() => setCurrentPlan(plan.name)}
                    >
                      {isActive ? 'Current Plan' : `Select ${plan.name}`}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
