'use client';

import React, { useState, useEffect } from 'react';
import Card, { StatCard } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { PRICING_PLANS } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { mockBusiness } from '@/lib/mock-data';
import {
  CreditCard,
  Zap,
  CheckCircle2,
  Calendar,
  Sparkles,
  Receipt,
  Download,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface DBSubscription {
  plan_name: string;
  status: string;
  current_period_start: string;
  current_period_end: string | null;
}

interface DBPaymentOrder {
  id: string;
  razorpay_order_id: string;
  amount: number;
  status: string;
  plan_name: string;
  created_at: string;
}

export default function BillingPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [subscription, setSubscription] = useState<DBSubscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<DBPaymentOrder[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState<string | null>(null); // tracks plan name loading

  // Helper to load Razorpay Checkout Script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Fetch subscription and payment history from Supabase
  const fetchData = async () => {
    if (!user) return;
    try {
      setIsLoadingData(true);

      // 1. Fetch Subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('plan_name, status, current_period_start, current_period_end')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subError) {
        console.error('Error fetching subscription:', subError);
      } else {
        setSubscription(subData);
      }

      // 2. Fetch Payment Orders (Paid only)
      const { data: ordersData, error: ordersError } = await supabase
        .from('payment_orders')
        .select('id, razorpay_order_id, amount, status, plan_name, created_at')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching payment history:', ordersError);
      } else {
        setPaymentHistory(ordersData || []);
      }
    } catch (err) {
      console.error('Data retrieval exception:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Launch Razorpay Checkout
  const handleUpgrade = async (planName: string) => {
    setIsCheckoutLoading(planName);
    try {
      // 1. Load script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        showToast('Failed to load Razorpay payment SDK. Please check your internet connection.', 'error');
        setIsCheckoutLoading(null);
        return;
      }

      // 2. Get user token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast('Authentication session expired. Please log in again.', 'error');
        setIsCheckoutLoading(null);
        return;
      }
      const token = session.access_token;

      // 3. Create order on server side
      const orderRes = await fetch('/api/billing/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ planName }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.error || 'Failed to initialize payment order');
      }

      const orderData = await orderRes.json();

      // 4. Open Razorpay checkout in Test Mode
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'BizPilot AI',
        description: `Upgrade to ${planName} Plan (Test Mode)`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // Trigger server verification
            const verifyRes = await fetch('/api/billing/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planName,
              }),
            });

            if (!verifyRes.ok) {
              const verifyError = await verifyRes.json();
              throw new Error(verifyError.error || 'Payment signature verification failed');
            }

            showToast(`Successfully upgraded to the ${planName} Plan!`, 'success');
            fetchData();
          } catch (verifyErr: any) {
            showToast(verifyErr.message || 'Signature verification failed. Payment not recorded.', 'error');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#4f46e5', // Brand Indigo
        },
        modal: {
          ondismiss: function () {
            showToast('Upgrade process cancelled by user.', 'info');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error('Checkout error:', err);
      showToast(err.message || 'An error occurred initiating checkout.', 'error');
    } finally {
      setIsCheckoutLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-100 text-emerald-700">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-rose-100 text-rose-700">Failed</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700">{status}</Badge>;
    }
  };

  const activePlanName = subscription?.plan_name || 'Free';
  const activePlanStatus = subscription?.status || 'active';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-indigo-600" />
            Billing & Subscription
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your subscription plans, payment methods, and invoice history.
          </p>
        </div>
      </div>

      {/* ── Sandbox Mode Banner ────────────────────────── */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm shadow-sm animate-pulse-slow">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Razorpay Test Mode Active:</span> All subscription upgrades and billing orders are processed in sandbox environments. Do not enter real credit card, bank, or UPI credentials.
        </div>
      </div>

      {/* ── Current Plan Summary ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2 border-indigo-150 bg-gradient-to-br from-white via-indigo-50/10 to-blue-50/20">
          {isLoadingData ? (
            <div className="flex flex-col justify-center items-center py-10 space-y-3">
              <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Retrieving subscription status...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-600 text-white font-bold text-xs uppercase px-2.5 py-1">
                      {activePlanStatus.toUpperCase()}
                    </Badge>
                    {activePlanName === 'Pro' && (
                      <Badge className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                        <Sparkles className="h-3 w-3 mr-1 inline" /> Popular
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-3">
                    {activePlanName} Plan
                  </h2>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    {activePlanName === 'Free'
                      ? 'Get started with basic CRM features and manual follow-ups.'
                      : activePlanName === 'Pro'
                      ? 'Unlock automated follow-ups, AI lead scoring, and reports.'
                      : 'Full AI enterprise automation dashboard and priority support.'}
                  </p>
                </div>
                <div className="shrink-0 text-left sm:text-right">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {activePlanName === 'Free' ? '₹0' : activePlanName === 'Pro' ? '₹999' : '₹2,999'}
                  </span>
                  <span className="text-slate-500 text-sm">/month</span>
                  {subscription?.current_period_end && (
                    <p className="text-xs text-slate-400 mt-1">
                      Next renewal: {formatDate(subscription.current_period_end)}
                    </p>
                  )}
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => showToast('Subscription cancellations are not enabled in Test Mode.', 'warning')}
                  >
                    Cancel Plan
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>

        <StatCard
          icon={<Zap className="h-5 w-5 text-indigo-600" />}
          label="AI Credits Usage"
          value="84 / Unlimited"
          trend="Resets in 25 days"
          className="bg-white"
        />
      </div>

      {/* ── Plans Upgrade Comparator ──────────────────── */}
      <div>
        <h3 className="font-bold text-slate-900 text-lg mb-4">Available Pricing Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_PLANS.map((plan) => {
            const isActive = activePlanName.toLowerCase() === plan.name.toLowerCase();
            const isPlanLoading = isCheckoutLoading === plan.name;
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
                    className="w-full flex items-center justify-center gap-2"
                    size="sm"
                    disabled={isActive || isCheckoutLoading !== null}
                    isLoading={isPlanLoading}
                    onClick={() => handleUpgrade(plan.name)}
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
          {isLoadingData ? (
            <div className="p-8 flex justify-center items-center">
              <Loader2 className="h-6 w-6 text-indigo-600 animate-spin mr-2" />
              <span className="text-sm text-slate-500 font-medium">Fetching transaction list...</span>
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm font-medium">
              No transactions recorded. Upgrade to a paid plan to view history.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {paymentHistory.map((invoice) => (
                <div
                  key={invoice.id}
                  className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-4 px-5 py-4 items-center hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center justify-between sm:justify-start gap-2">
                    <span className="text-xs font-bold text-indigo-600">{invoice.razorpay_order_id.substring(0, 12)}...</span>
                    <span className="sm:hidden text-xs text-slate-500">{formatDate(invoice.created_at)}</span>
                  </div>
                  <span className="hidden sm:inline text-xs text-slate-600">
                    {formatDate(invoice.created_at)}
                  </span>
                  <span className="text-xs text-slate-700 font-medium col-span-1 sm:col-span-2">
                    BizPilot AI {invoice.plan_name} Plan Subscription
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {formatCurrency(invoice.amount)}
                  </span>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    {getStatusBadge(invoice.status)}
                    <button
                      onClick={() => showToast(`Invoice downloaded successfully! (Simulated)`, 'success')}
                      title="Download Invoice"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
