// ============================================================
// BizPilot AI — App Constants
// ============================================================

import { type LeadStatus, type LeadSource, type BusinessType, type ToneOption } from './types';

export const APP_NAME = 'BizPilot AI';
export const APP_DESCRIPTION = 'Your AI Employee for Sales, Follow-ups, Bookings & Payments';
export const APP_TAGLINE = 'Never lose a customer again.';

// ---- Lead Statuses ----
export const LEAD_STATUSES: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-700' },
  { value: 'contacted', label: 'Contacted', color: 'bg-amber-100 text-amber-700' },
  { value: 'hot', label: 'Hot 🔥', color: 'bg-orange-100 text-orange-700' },
  { value: 'booked', label: 'Booked', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'paid', label: 'Paid ✅', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'lost', label: 'Lost', color: 'bg-slate-100 text-slate-500' },
];

// ---- Lead Sources ----
export const LEAD_SOURCES: { value: LeadSource; label: string; icon: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'website', label: 'Website', icon: '🌐' },
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'referral', label: 'Referral', icon: '🤝' },
  { value: 'manual', label: 'Manual', icon: '✍️' },
];

// ---- Business Types ----
export const BUSINESS_TYPES: { value: BusinessType; label: string; emoji: string }[] = [
  { value: 'coaching_center', label: 'Coaching Center', emoji: '📚' },
  { value: 'clinic', label: 'Clinic / Hospital', emoji: '🏥' },
  { value: 'salon', label: 'Salon / Spa', emoji: '💇' },
  { value: 'repair_shop', label: 'Repair Shop', emoji: '🔧' },
  { value: 'agency', label: 'Agency', emoji: '🏢' },
  { value: 'consultant', label: 'Consultant', emoji: '💼' },
  { value: 'real_estate', label: 'Real Estate', emoji: '🏠' },
  { value: 'fitness_trainer', label: 'Fitness / Gym', emoji: '💪' },
  { value: 'other', label: 'Other', emoji: '⚡' },
];

// ---- Tone Options ----
export const TONE_OPTIONS: ToneOption[] = [
  { value: 'professional', label: 'Professional', emoji: '👔' },
  { value: 'friendly', label: 'Friendly', emoji: '😊' },
  { value: 'hinglish', label: 'Hinglish', emoji: '🇮🇳' },
  { value: 'short', label: 'Short & Direct', emoji: '⚡' },
  { value: 'persuasive', label: 'Persuasive', emoji: '🎯' },
];

// ---- Navigation Items ----
export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/dashboard/leads', label: 'Leads', icon: 'Users' },
  { href: '/dashboard/follow-ups', label: 'Follow-ups', icon: 'MessageSquare' },
  { href: '/dashboard/appointments', label: 'Appointments', icon: 'Calendar' },
  { href: '/dashboard/invoices', label: 'Invoices', icon: 'Receipt' },
  { href: '/dashboard/reviews', label: 'Reviews', icon: 'Star' },
  { href: '/dashboard/reports', label: 'AI Reports', icon: 'BarChart3' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'Settings' },
] as const;

// ---- Business Goals ----
export const BUSINESS_GOALS = [
  { value: 'more_leads', label: 'Get More Leads', emoji: '📈' },
  { value: 'more_bookings', label: 'More Bookings', emoji: '📅' },
  { value: 'more_payments', label: 'Collect Payments Faster', emoji: '💰' },
  { value: 'better_followup', label: 'Better Follow-ups', emoji: '🔄' },
];

// ---- Payment Methods ----
export const PAYMENT_METHODS = [
  { value: 'upi', label: 'UPI (GPay, PhonePe)' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'razorpay', label: 'Razorpay' },
  { value: 'stripe', label: 'Stripe' },
];

// ---- Pricing Plans ----
export const PRICING_PLANS = [
  {
    name: 'Free',
    price: 0,
    priceLabel: '₹0',
    period: '/month',
    description: 'Get started with basic CRM features',
    features: [
      '25 leads/month',
      'Basic CRM',
      'Manual follow-ups',
      'Appointment scheduling',
      'Email support',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: 999,
    priceLabel: '₹999',
    period: '/month',
    description: 'AI-powered features for growing businesses',
    features: [
      'Unlimited leads',
      'AI follow-up messages',
      'AI lead scoring',
      'Appointment reminders',
      'Invoice tracking',
      'Revenue analytics',
      'WhatsApp message templates',
      'Priority email support',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Business',
    price: 2999,
    priceLabel: '₹2,999',
    period: '/month',
    description: 'Full AI automation for teams',
    features: [
      'Everything in Pro',
      'Staff accounts (up to 10)',
      'Advanced AI daily reports',
      'AI missed opportunity detection',
      'Payment automation',
      'Custom message templates',
      'API access',
      'Priority phone support',
      'Dedicated account manager',
    ],
    cta: 'Start Business Trial',
    popular: false,
  },
];

// ---- Default Working Hours ----
export const DEFAULT_WORKING_HOURS = {
  monday: { isOpen: true, open: '09:00', close: '18:00' },
  tuesday: { isOpen: true, open: '09:00', close: '18:00' },
  wednesday: { isOpen: true, open: '09:00', close: '18:00' },
  thursday: { isOpen: true, open: '09:00', close: '18:00' },
  friday: { isOpen: true, open: '09:00', close: '18:00' },
  saturday: { isOpen: true, open: '09:00', close: '14:00' },
  sunday: { isOpen: false, open: '09:00', close: '18:00' },
};
