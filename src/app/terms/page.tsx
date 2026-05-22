'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function TermsPage() {
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
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service</h1>
              <p className="text-sm text-slate-500 mt-1">Last updated: May 22, 2026</p>
            </div>
          </div>

          {/* Sandbox Disclaimer Box */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-sm leading-relaxed">
            <span className="font-bold block text-amber-800 mb-1">Sandbox Preview Notice</span>
            By accessing or using BizPilot AI, you acknowledge that this is a simulated workspace environment designed for evaluation. Upgrades, invoice mock-payments, and notifications do not represent real-world legal liabilities or financial commitments.
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-sm text-slate-600 leading-relaxed">
            <h2 className="text-xl font-bold text-slate-900 pt-4 border-t border-slate-100">1. Acceptance of Terms</h2>
            <p>
              By accessing our services, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.
            </p>

            <h2 className="text-xl font-bold text-slate-900 pt-4 border-t border-slate-100">2. Sandbox & Verification Use</h2>
            <p>
              BizPilot AI is designed for evaluation and showcase purposes. It integrates the following test configurations:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Razorpay Test Mode</strong>: Subscriptions upgrades on our billing dashboard are completed entirely inside the Razorpay payment simulator. Real money should not be processed.</li>
              <li><strong>Mock AI Follow-ups</strong>: Content templates (Hinglish/English message scoring) are computed inside local scripts and should not be used as official communication without review.</li>
              <li><strong>Lead Management</strong>: Real contact names, emails, and client details are treated purely as sandbox mock lists.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 pt-4 border-t border-slate-100">3. User Responsibility & Safety Rules</h2>
            <p>
              To maintain the integrity and safety of the sandbox application, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Avoid inputting any real sensitive personal data, actual credit card credentials, or production server secrets.</li>
              <li>Use the app purely in accordance with its designed sandbox capabilities.</li>
              <li>Not attempt to exploit, disrupt, or interfere with database storage nodes.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 pt-4 border-t border-slate-100">4. Limitations of Liability</h2>
            <p>
              BizPilot AI is provided "as-is" and "as-available" without warranties of any kind. Under no circumstances will the developers, sponsors, or providers of this application be held liable for any loss, damage, or security issues resulting from its evaluation.
            </p>

            <h2 className="text-xl font-bold text-slate-900 pt-4 border-t border-slate-100">5. Termination</h2>
            <p>
              We reserve the right to suspend or close access to any sandbox user account at any time for violation of usage safety rules, database spamming, or security evaluation overrides.
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
