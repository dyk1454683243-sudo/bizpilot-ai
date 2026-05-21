'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Check, X, ArrowRight, HelpCircle, Star, Sparkles } from 'lucide-react';
import { PRICING_PLANS } from '@/lib/constants';
import Button from '@/components/ui/Button';

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const comparisonFeatures = [
    { name: 'Leads per Month', free: '25 leads', pro: 'Unlimited', business: 'Unlimited' },
    { name: 'Lead CRM', free: true, pro: true, business: true },
    { name: 'Manual Follow-ups', free: true, pro: true, business: true },
    { name: 'AI Follow-up Messages', free: false, pro: true, business: true },
    { name: 'AI Lead Scoring', free: false, pro: true, business: true },
    { name: 'Appointment Reminders', free: 'Manual', pro: 'Automatic SMS/WA', business: 'Automatic + Customizable' },
    { name: 'Invoice Tracking', free: 'Basic (5/mo)', pro: 'Unlimited', business: 'Unlimited' },
    { name: 'Staff Accounts', free: 'Owner only', pro: '1 Staff Account', business: 'Up to 10 Staff Accounts' },
    { name: 'Daily AI Reports', free: false, pro: 'Basic Summary', business: 'Advanced Insights & Action Plan' },
    { name: 'Payment Automation', free: false, pro: 'Placeholder Link', business: 'Coming Soon Auto-reconcile' },
    { name: 'Support', free: 'Email Support', pro: 'Priority Email', business: '24/7 Phone + Chat Support' },
  ];

  const pricingFaqs = [
    {
      q: 'How does the free trial work?',
      a: 'When you sign up for the Pro or Business plans, you get a 14-day free trial period. You will have full access to all features under that plan. You can cancel at any time during the trial and you won\'t be charged.',
    },
    {
      q: 'What happens if I reach the 25 lead limit on the Free plan?',
      a: 'If you exceed 25 leads in a month on the Free plan, you won\'t be able to add new leads until the next calendar month starts or you upgrade to the Pro plan. We will send you an email warning before you hit the limit.',
    },
    {
      q: 'Are there any setup fees or hidden charges?',
      a: 'No. There are absolutely no setup fees, hidden charges, or contracts. You pay exactly what is listed, billed monthly or annually. You can cancel your subscription with a single click.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit cards, debit cards, UPI payments (GPay, PhonePe, Paytm), and Net Banking via our payment processor.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              <span className="text-indigo-600">Biz</span>Pilot
            </span>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
              AI
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Home
            </Link>
            <Link href="/#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Features
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button onClick={() => router.push('/dashboard')} variant="primary" size="md">
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors">
                  Log in
                </Link>
                <Button onClick={() => router.push('/signup')} variant="primary" size="md">
                  Start Free
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO HERO TITLE */}
      <section className="py-16 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
          Start for free, then upgrade to unlock powerful AI workflows, booking automations, and detailed reports as your business grows.
        </p>

        {/* Billing Period Selector */}
        <div className="inline-flex items-center gap-3 bg-white p-1 rounded-full border border-slate-200">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`text-xs font-bold px-4 py-2 rounded-full transition-all ${
              billingPeriod === 'monthly' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`text-xs font-bold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
              billingPeriod === 'yearly' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            Yearly Billing
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </section>

      {/* CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {PRICING_PLANS.map((plan) => {
            const displayPrice =
              billingPeriod === 'yearly'
                ? Math.round(plan.price * 0.8 * 12)
                : plan.price;
            const priceLabel =
              plan.price === 0
                ? '₹0'
                : billingPeriod === 'yearly'
                ? `₹${displayPrice.toLocaleString('en-IN')}`
                : `₹${plan.price.toLocaleString('en-IN')}`;
            const periodLabel = plan.price === 0 ? '' : billingPeriod === 'yearly' ? '/year' : '/month';

            return (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl border flex flex-col justify-between p-8 relative transition-all duration-300 ${
                  plan.popular
                    ? 'border-indigo-600 shadow-xl shadow-indigo-100/50 scale-105 z-10 md:-translate-y-2'
                    : 'border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {plan.popular && (
                  <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                <div>
                  <h2 className="text-xl font-bold text-slate-950 mb-2">{plan.name}</h2>
                  <p className="text-xs text-slate-500 mb-6">{plan.description}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold text-slate-950">{priceLabel}</span>
                    <span className="text-sm font-semibold text-slate-500">{periodLabel}</span>
                  </div>

                  <hr className="border-slate-100 mb-6" />

                  <ul className="space-y-4 mb-8 text-left">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => router.push('/signup')}
                  variant={plan.popular ? 'primary' : 'outline'}
                  className="w-full py-2.5 font-bold"
                >
                  {plan.cta}
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* DETAILED PLAN COMPARISON */}
      <section className="bg-white border-y border-slate-200 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-extrabold text-slate-950">Detailed Feature Comparison</h3>
            <p className="text-sm text-slate-500 mt-2">See exactly what you get at each level</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse bg-white">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 uppercase">
                  <th className="px-6 py-4">Features</th>
                  <th className="px-6 py-4">Free Plan</th>
                  <th className="px-6 py-4 bg-indigo-50/50 text-indigo-900">Pro Plan</th>
                  <th className="px-6 py-4">Business Plan</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600">
                {comparisonFeatures.map((f, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{f.name}</td>

                    {/* Free column */}
                    <td className="px-6 py-4">
                      {f.free === true ? (
                        <Check className="h-5 w-5 text-emerald-600" />
                      ) : f.free === false ? (
                        <X className="h-5 w-5 text-rose-400" />
                      ) : (
                        <span>{f.free}</span>
                      )}
                    </td>

                    {/* Pro column */}
                    <td className="px-6 py-4 bg-indigo-50/20">
                      {f.pro === true ? (
                        <Check className="h-5 w-5 text-emerald-600" />
                      ) : f.pro === false ? (
                        <X className="h-5 w-5 text-rose-400" />
                      ) : (
                        <span className="font-medium text-slate-900">{f.pro}</span>
                      )}
                    </td>

                    {/* Business column */}
                    <td className="px-6 py-4">
                      {f.business === true ? (
                        <Check className="h-5 w-5 text-emerald-600" />
                      ) : f.business === false ? (
                        <X className="h-5 w-5 text-rose-400" />
                      ) : (
                        <span>{f.business}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PRICING FAQ */}
      <section className="py-20 max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <HelpCircle className="h-10 w-10 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-3xl font-extrabold text-slate-950">Pricing FAQs</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {pricingFaqs.map((faq, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="font-bold text-slate-900 text-base">{faq.q}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h3 className="text-3xl font-extrabold">Ready to automate your operations?</h3>
          <p className="text-indigo-200 text-sm max-w-md mx-auto">
            Choose a plan, start your 14-day free trial, and see how much time and revenue you save. No credit card required to start.
          </p>
          <div className="pt-2">
            <Button
              onClick={() => router.push('/signup')}
              variant="secondary"
              className="bg-white text-indigo-950 hover:bg-slate-100 font-bold px-8 py-2.5"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
