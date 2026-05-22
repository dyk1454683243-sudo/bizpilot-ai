'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Error 404</span>
        </div>

        {/* 404 Title */}
        <h1 className="text-8xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
          404
        </h1>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Page Not Found</h2>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Sorry, the page you are looking for does not exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto" size="md">
              <Home className="mr-2 h-4 w-4" /> Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="primary" className="w-full sm:w-auto" size="md">
              <ArrowLeft className="mr-2 h-4 w-4" /> Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
