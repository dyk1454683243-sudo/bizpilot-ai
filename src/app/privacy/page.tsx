'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              <span className="text-indigo-600">Biz</span>Pilot
            </span>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
              AI
            </span>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 space-y-8">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
              <p className="text-sm text-slate-500 mt-1">Last updated: May 22, 2026</p>
            </div>
          </div>

          {/* Sandbox Disclaimer Box */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-sm leading-relaxed">
            <span className="font-bold block text-amber-800 mb-1">Sandbox Test Environment Disclaimer</span>
            BizPilot AI is a sandbox preview and demonstration platform. All user profiles, leads data, customer booking schedules, and invoice documents created on this application are simulated, test-only representations. No real credit card, financial, or UPI keys are collected or processed.
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-sm text-slate-600 leading-relaxed">
            <h2 className="text-xl font-bold text-slate-900 pt-4 border-t border-slate-100">1. Information We Collect</h2>
            <p>
              When you register a sandbox account, we save basic data needed to customize your dashboard:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Credentials</strong>: Email address and encrypted passwords provided during signup or OAuth identifiers passed by Google Authentication.</li>
              <li><strong>Business Profile Info</strong>: Company name, currency preferences, UPI tags, business categories, operational hours, and contact information.</li>
              <li><strong>CRM Operations Data</strong>: Lead records (names, phone details, interest fields), appointments scheduled, billing items, review summaries, and report aggregates.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 pt-4 border-t border-slate-100">2. How We Use Information</h2>
            <p>
              Your data is utilized strictly to render your custom dashboard workspace:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To persist lead scores, client dates, and test invoices.</li>
              <li>To dynamically generate Hinglish/English follow-up templates inside the browser canvas.</li>
              <li>To mock and verify subscriptions and upgrades via Razorpay API checkout simulators.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 pt-4 border-t border-slate-100">3. Data Sharing & Security</h2>
            <p>
              We prioritize data safety. BizPilot AI uses Supabase infrastructure to securely manage PostgreSQL connections and user access lists.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We do not sell, rent, or trade sandbox CRM data to third parties.</li>
              <li>No real credentials or API tokens should be saved within the public mock inputs.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 pt-4 border-t border-slate-100">4. Third-Party Connections</h2>
            <p>
              This site utilizes standard external interfaces:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Supabase</strong>: Database storage and credentials security.</li>
              <li><strong>Razorpay Checkout SDK</strong>: Invoked in Test Mode/Sandbox. No real money or keys are transferred.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 pt-4 border-t border-slate-100">5. Changes to This Policy</h2>
            <p>
              We reserve the right to modify this policy as the platform upgrades. Reviewers are encouraged to visit this page periodically.
            </p>
          </div>

          <div className="pt-8 border-t border-slate-100 text-center">
            <Link href="/">
              <Button variant="primary">Return to Homepage</Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-8 border-t border-slate-800 text-center text-xs">
        <p>© 2026 BizPilot AI. Built for sandbox and evaluation purposes.</p>
      </footer>
    </div>
  );
}
