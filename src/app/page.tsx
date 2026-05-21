'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  MessageSquare,
  Calendar,
  Receipt,
  Star,
  BarChart3,
  Check,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Play,
  Heart,
  TrendingUp,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PRICING_PLANS, BUSINESS_TYPES, BUSINESS_GOALS } from '@/lib/constants';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const faqs = [
    {
      q: 'What is BizPilot AI?',
      a: 'BizPilot AI is an AI-powered Business Operator for service businesses. It acts like an AI employee that automatically tracks your leads, drafts custom follow-up messages (in English & Hinglish), schedules appointments, creates invoices, and analyzes your daily operations to ensure you never lose revenue.',
    },
    {
      q: 'Do I need technical knowledge to use it?',
      a: 'Not at all! We designed BizPilot AI specifically for non-technical service owners. If you can use WhatsApp, you can easily manage your entire business on BizPilot AI. Our interface is extremely clean, simple, and intuitive.',
    },
    {
      q: 'How does the AI Follow-Up feature work?',
      a: 'Our AI analyzes each lead\'s notes, interested service, and history to generate a highly personalized message. You can select the tone (Professional, Friendly, Hinglish, Short, or Persuasive) and copy it directly to WhatsApp, SMS, or Email in one click.',
    },
    {
      q: 'Can I manage my staff on the platform?',
      a: 'Yes, our Business Plan supports up to 10 staff accounts. You can assign specific services to staff members, manage their schedules, and let them manage leads assigned to them.',
    },
    {
      q: 'Is there a free trial?',
      a: 'Yes, we have a Free Plan which allows you to manage up to 25 leads per month with basic CRM features. For advanced AI features, follow-up automation, and invoice tracking, you can try our Pro or Business plans with a 14-day free trial.',
    },
    {
      q: 'Can I cancel or change my plan anytime?',
      a: 'Yes, you can upgrade, downgrade, or cancel your subscription at any time directly from your billing settings. There are no long-term contracts or cancellation fees.',
    },
  ];

  const testimonials = [
    {
      name: 'Rohit Kapoor',
      business: 'Kapoor Dental Clinic',
      rating: 5,
      text: 'BizPilot AI has completely changed how we handle patient inquiries. The Hinglish follow-up generator is a lifesaver! Our booking rate increased by 35% in just the first month.',
    },
    {
      name: 'Sonia Sen',
      business: 'Glitz & Glam Salon',
      rating: 5,
      text: 'Earlier we managed bookings on a notebook and lost track of clients. Now, BizPilot handles our calendar, sends automated reminders, and generates reviews. Highly recommended!',
    },
    {
      name: 'Amit Verma',
      business: 'Verma JEE Academy',
      rating: 5,
      text: 'With over 100 students inquiring every month, follow-ups were impossible. BizPilot AI scores our leads so we know who is serious, and drafts perfect WhatsApp messages to close them.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              <span className="text-indigo-600">Biz</span>Pilot
            </span>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
              AI
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Features
            </a>
            <a href="#use-cases" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Use Cases
            </a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
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

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-6 flex flex-col gap-4 shadow-lg animate-scale-in">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 hover:text-slate-900 py-2"
            >
              Features
            </a>
            <a
              href="#use-cases"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 hover:text-slate-900 py-2"
            >
              Use Cases
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 hover:text-slate-900 py-2"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 hover:text-slate-900 py-2"
            >
              FAQ
            </a>
            <hr className="border-slate-100" />
            {isAuthenticated ? (
              <Button onClick={() => { setMobileMenuOpen(false); router.push('/dashboard'); }} className="w-full">
                Go to Dashboard
              </Button>
            ) : (
              <div className="flex flex-col gap-3">
                <Button onClick={() => { setMobileMenuOpen(false); router.push('/login'); }} variant="outline" className="w-full">
                  Log in
                </Button>
                <Button onClick={() => { setMobileMenuOpen(false); router.push('/signup'); }} className="w-full">
                  Start Free
                </Button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 gradient-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="md:col-span-7 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6 animate-fade-in">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Your AI Employee is Ready to Work</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight sm:leading-none mb-6">
                Your AI Employee for{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Sales, Bookings & Payments
                </span>
              </h1>
              <p className="text-lg text-slate-600 max-w-xl mb-8 leading-relaxed">
                Never lose a customer again. BizPilot AI helps small businesses capture leads, automate follow-ups, book appointments, collect reviews, and grow revenue — all in one simple, mobile-friendly app.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button
                  onClick={() => router.push(isAuthenticated ? '/dashboard' : '/signup')}
                  variant="primary"
                  size="lg"
                  className="px-8 shadow-lg shadow-indigo-200"
                >
                  Start Free — No Card Needed
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <a href="#features">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Play className="mr-2 h-4 w-4 fill-slate-600 text-slate-600" />
                    See How It Works
                  </Button>
                </a>
              </div>

              {/* Social Proof Stats */}
              <div className="mt-12 border-t border-slate-200 pt-8 w-full max-w-lg">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">2,500+</p>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Businesses*</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">50K+</p>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Leads Managed*</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">₹2Cr+</p>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Payments Tracked*</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 italic">*Metrics are simulated for MVP preview and demonstration purposes</p>
              </div>
            </div>

            {/* Right Hero Illustration */}
            <div className="md:col-span-5 relative w-full flex justify-center animate-float">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-6 relative">
                {/* Visual Dashboard Elements */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-rose-500" />
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">BizPilot AI Dashboard</span>
                </div>

                {/* Score Circle & Sparkle */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-indigo-700 font-semibold uppercase tracking-wider">AI Business Score</p>
                    <p className="text-2xl font-extrabold text-indigo-900">84/100</p>
                  </div>
                  <div className="h-12 w-12 rounded-full border-4 border-indigo-600/30 border-t-indigo-600 flex items-center justify-center font-bold text-indigo-900 bg-white">
                    84%
                  </div>
                </div>

                {/* Mini Lead CRM Row */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Hot Leads</p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name="Priya Mehta" size="sm" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Priya Mehta</p>
                        <p className="text-[10px] text-slate-500">JEE Coaching</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Hot 🔥</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name="Kavita Nair" size="sm" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Kavita Nair</p>
                        <p className="text-[10px] text-slate-500">NEET Coaching</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Booked</span>
                  </div>
                </div>

                {/* AI Follow-Up Generator Box */}
                <div className="border border-indigo-100 rounded-xl p-4 bg-white space-y-3 shadow-md shadow-indigo-50/50">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                    <Sparkles className="h-4 w-4" />
                    <span>AI Follow-Up Message (Hinglish)</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-600 italic">
                    "Hi Priya! 🙏 Aapne JEE coaching ke baare mein inquiry ki thi. Humari new batch Monday se start ho rahi hai..."
                  </div>
                  <div className="flex justify-end gap-2">
                    <span className="text-[10px] text-slate-400 self-center">Copy & Send via:</span>
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded cursor-pointer hover:bg-emerald-600 transition-colors">WhatsApp 💬</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Feature Suite</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Everything you need to run your business like a pro
            </h3>
            <p className="text-lg text-slate-600">
              BizPilot AI replaces multiple disjointed tools with a single, integrated platform designed specifically for service-based businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200/60 hover:shadow-lg hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Smart Lead CRM</h4>
              <p className="text-slate-600 leading-relaxed">
                Add leads manually or import from CSV. Track statuses, maintain active notes, and view timelines. AI scores every lead so you focus on the hottest clients.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200/60 hover:shadow-lg hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">AI Follow-Up Agent</h4>
              <p className="text-slate-600 leading-relaxed">
                Draft customized templates or generate unique follow-ups in English or Hinglish. Choose your tone (professional, friendly, persuasive) and send directly to WhatsApp.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200/60 hover:shadow-lg hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                <Calendar className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Appointment Booking</h4>
              <p className="text-slate-600 leading-relaxed">
                A weekly calendar view and daily schedules to organize bookings. Send automatic reminders to reduce no-shows. Easily reschedule or cancel with customer alerts.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200/60 hover:shadow-lg hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                <Receipt className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Invoices & Payments</h4>
              <p className="text-slate-600 leading-relaxed">
                Create simple professional invoices. Track who has paid, send UPI payment reminders, and see monthly collections. Ready for Razorpay/Stripe placeholder linkages.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200/60 hover:shadow-lg hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="h-12 w-12 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center mb-6">
                <Star className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Review Collection</h4>
              <p className="text-slate-600 leading-relaxed">
                Automatically draft and send review requests after service completion. Store testimonials and ratings to showcase your credibility to new clients.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200/60 hover:shadow-lg hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="h-12 w-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">AI Daily Business Report</h4>
              <p className="text-slate-600 leading-relaxed">
                Receive non-technical reports summary detailing new leads, conversion scores, missed revenue alerts, and actionable check-lists for tomorrow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* USE CASES BY BUSINESS TYPE */}
      <section id="use-cases" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Tailored For You</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Built for all service business owners
            </h3>
            <p className="text-lg text-slate-600">
              No matter what services you offer, BizPilot AI helps you streamline operations and grow revenue.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {BUSINESS_TYPES.map((type) => (
              <div key={type.value} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center flex flex-col items-center hover:shadow-md hover:border-indigo-200 transition-all duration-200">
                <span className="text-4xl mb-4">{type.emoji}</span>
                <span className="text-base font-bold text-slate-900 mb-2">{type.label}</span>
                <span className="text-xs text-slate-500">
                  {type.value === 'coaching_center' && 'Manage admissions & batches'}
                  {type.value === 'clinic' && 'Confirm patient appointments'}
                  {type.value === 'salon' && 'Schedule slots & stylist alerts'}
                  {type.value === 'repair_shop' && 'Invoicing & repair timelines'}
                  {type.value === 'agency' && 'Lead scoring & proposals'}
                  {type.value === 'consultant' && 'Calendar slots & payments'}
                  {type.value === 'real_estate' && 'Client tracking & followups'}
                  {type.value === 'fitness_trainer' && 'Workout bookings & subs'}
                  {type.value === 'other' && 'Boost your service sales'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Simulated Case Studies</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Loved by business owners like you
            </h3>
            <p className="text-sm text-slate-500 mt-2">*Demo testimonies representing realistic business workflows</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-slate-50 p-8 rounded-2xl border border-slate-200/60 relative flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex text-amber-500 gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 italic leading-relaxed">"{t.text}"</p>
                </div>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-200">
                  <Avatar name={t.name} size="sm" />
                  <div>
                    <h5 className="text-sm font-bold text-slate-950">{t.name}</h5>
                    <p className="text-xs text-slate-500">{t.business}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Pricing Plans</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Simple, transparent pricing
            </h3>
            <p className="text-lg text-slate-600">
              Start with our free tier, upgrade when you need AI and staff management.
            </p>

            {/* Toggle Billing Period */}
            <div className="inline-flex items-center gap-3 mt-6 bg-white p-1 rounded-full border border-slate-200">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                  billingPeriod === 'monthly' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-950'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                  billingPeriod === 'yearly' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-950'
                }`}
              >
                Yearly
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
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
                      ? 'border-indigo-600 shadow-xl shadow-indigo-100/50 scale-105 z-10 md:-translate-y-1'
                      : 'border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                      Most Popular
                    </span>
                  )}
                  <div>
                    <h4 className="text-xl font-bold text-slate-950 mb-2">{plan.name}</h4>
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

          <div className="text-center mt-12">
            <Link href="/pricing" className="text-indigo-600 hover:text-indigo-700 font-bold text-sm inline-flex items-center gap-1">
              View Detailed Plan Comparison
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">FAQ</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden transition-all">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left font-bold text-slate-900 hover:bg-slate-100/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform duration-200 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-200/50 pt-3 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 gradient-hero text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight">Ready to pilot your business to success?</h2>
          <p className="text-indigo-100 text-lg max-w-xl mx-auto">
            Designed for small business owners to save 10+ hours a week and scale sales using smart operations automation.
          </p>
          <div className="pt-4">
            <Button
              onClick={() => router.push('/signup')}
              variant="secondary"
              size="lg"
              className="bg-white text-indigo-700 hover:bg-slate-100 font-bold px-10 shadow-xl"
            >
              Start Your Free Account Now
            </Button>
          </div>
          <p className="text-xs text-indigo-200/80">No credit card required. Cancel anytime. 14-day trial of Pro features.</p>
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">
                <span className="text-indigo-400">Biz</span>Pilot
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                AI
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your AI Employee for Sales, Follow-ups, Bookings & Payments. Designed specifically for small service businesses.
            </p>
          </div>

          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Product</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Company</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Legal</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 BizPilot AI. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-rose-500 fill-current" /> for small businesses worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
