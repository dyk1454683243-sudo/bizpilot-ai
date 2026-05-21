'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, User, Building2, Shield, Languages } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAuth } from '@/contexts/AuthContext';

export default function SimpleSettingsPage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(name, email);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-8">
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
            <Settings className="h-8 w-8 text-indigo-600" />
            Account Settings
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Configure your personal profile and business defaults.
          </p>
        </div>

        {/* Settings Form Card */}
        <Card className="p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-slate-400" />
              Personal Profile
            </h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                id="name"
                label="Full Name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                required
              />
              <Input
                id="email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
            </div>

            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 pt-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-slate-400" />
              Business Preferences
            </h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Select
                id="language"
                label="Default AI Language"
                options={[
                  { value: 'english', label: 'English' },
                  { value: 'hinglish', label: 'Hinglish (Hindi + English)' },
                ]}
              />
              <Select
                id="timezone"
                label="Time Zone"
                options={[
                  { value: 'ist', label: 'India Standard Time (IST)' },
                  { value: 'utc', label: 'Coordinated Universal Time (UTC)' },
                ]}
              />
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              {saved && (
                <span className="text-sm text-emerald-600 font-medium animate-pulse">
                  Changes saved successfully!
                </span>
              )}
              <Button type="submit" variant="primary" className={saved ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
