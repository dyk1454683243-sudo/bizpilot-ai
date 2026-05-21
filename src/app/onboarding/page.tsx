'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import {
  Building2,
  Briefcase,
  Clock,
  Rocket,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  BUSINESS_TYPES,
  BUSINESS_GOALS,
  PAYMENT_METHODS,
  DEFAULT_WORKING_HOURS,
} from '@/lib/constants';
import type { BusinessType, WorkingHours, Business, Service } from '@/lib/types';
import { mockBusiness } from '@/lib/mock-data';

interface ServiceEntry {
  name: string;
  price: string;
  duration: string;
}

const STEPS = [
  { label: 'Business', icon: Building2 },
  { label: 'Services', icon: Briefcase },
  { label: 'Preferences', icon: Clock },
  { label: 'Goals', icon: Rocket },
];

const DAYS: (keyof WorkingHours)[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export default function OnboardingPage() {
  const router = useRouter();
  const auth = useAuth();
  const { isAuthenticated, isLoading, hasCompletedOnboarding } = auth;
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (hasCompletedOnboarding) {
        router.push('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, hasCompletedOnboarding, router]);

  // Step 1 state
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType | ''>('');

  // Step 2 state
  const [services, setServices] = useState<ServiceEntry[]>([
    { name: '', price: '', duration: '60' },
  ]);
  const [workingHours, setWorkingHours] = useState<WorkingHours>(
    DEFAULT_WORKING_HOURS
  );

  // Step 3 state
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [language, setLanguage] = useState<'english' | 'hinglish'>('english');

  // Step 4 state
  const [goals, setGoals] = useState<string[]>([]);

  const canProceed = () => {
    switch (step) {
      case 0:
        return businessName.trim() !== '' && businessType !== '';
      case 1:
        return services.some((s) => s.name.trim() !== '');
      case 2:
        return whatsappNumber.trim() !== '' && paymentMethod !== '';
      case 3:
        return goals.length > 0;
      default:
        return false;
    }
  };

  const addService = () => {
    setServices([...services, { name: '', price: '', duration: '60' }]);
  };

  const removeService = (index: number) => {
    if (services.length <= 1) return;
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (
    index: number,
    field: keyof ServiceEntry,
    value: string
  ) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const toggleDay = (day: keyof WorkingHours) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], isOpen: !prev[day].isOpen },
    }));
  };

  const updateDayHours = (
    day: keyof WorkingHours,
    field: 'open' | 'close',
    value: string
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const finalServices: Service[] = services
        .filter((s) => s.name.trim() !== '')
        .map((s, idx) => ({
          id: `svc-${idx + 1}`,
          name: s.name,
          price: Number(s.price) || 0,
          duration: Number(s.duration) || 60,
        }));

      const businessData: Business = {
        id: 'biz-001',
        name: businessName,
        type: businessType as BusinessType || 'other',
        services: finalServices,
        workingHours: workingHours,
        whatsappNumber: whatsappNumber,
        paymentMethod: paymentMethod,
        upiId: paymentMethod === 'upi' ? `${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}@upi` : '',
        language: language,
        goals: goals,
        ownerId: auth.user?.id || 'user-001',
        createdAt: new Date().toISOString(),
      };

      // Mutate mockBusiness in memory so it updates immediately on next reads
      Object.assign(mockBusiness, businessData);

      localStorage.setItem('bizpilot_business', JSON.stringify(businessData));

      auth.completeOnboarding();
      // Simulate a short delay for UX
      await new Promise((r) => setTimeout(r, 600));
      router.push('/dashboard');
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-xl font-bold">
              <span className="text-indigo-600">Biz</span>
              <span className="text-slate-800">Pilot</span>
            </span>
            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-md">
              AI
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((s, i) => {
            const StepIcon = s.icon;
            const isCompleted = i < step;
            const isCurrent = i === step;

            return (
              <React.Fragment key={s.label}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={clsx(
                      'w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300',
                      isCompleted &&
                        'bg-indigo-600 text-white shadow-md shadow-indigo-200',
                      isCurrent &&
                        'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-600 ring-offset-2',
                      !isCompleted &&
                        !isCurrent &&
                        'bg-slate-100 text-slate-400'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={clsx(
                      'text-xs font-medium hidden sm:block',
                      isCurrent ? 'text-indigo-600' : 'text-slate-400'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 mx-2 sm:mx-4">
                    <div className="h-0.5 rounded-full bg-slate-200 relative overflow-hidden">
                      <div
                        className={clsx(
                          'absolute inset-y-0 left-0 bg-indigo-600 rounded-full transition-all duration-500',
                          isCompleted ? 'w-full' : 'w-0'
                        )}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-1.5 mb-8">
          <div
            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 animate-fade-in">
          {/* Step 1: Business Info */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Tell us about your business
              </h2>
              <p className="text-sm text-slate-500 mb-8">
                We&apos;ll customize BizPilot AI for your business type
              </p>

              <div className="space-y-6">
                <Input
                  label="Business Name"
                  id="businessName"
                  placeholder="e.g., BizPilot Academy"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Business Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {BUSINESS_TYPES.map((bt) => (
                      <button
                        key={bt.value}
                        onClick={() => setBusinessType(bt.value)}
                        className={clsx(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                          'hover:shadow-sm',
                          businessType === bt.value
                            ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300'
                        )}
                      >
                        <span className="text-2xl">{bt.emoji}</span>
                        <span
                          className={clsx(
                            'text-sm font-medium',
                            businessType === bt.value
                              ? 'text-indigo-700'
                              : 'text-slate-700'
                          )}
                        >
                          {bt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Services & Working Hours */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Your services & hours
              </h2>
              <p className="text-sm text-slate-500 mb-8">
                Add the services you offer and set your working hours
              </p>

              {/* Services */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Services
                </label>
                <div className="space-y-3">
                  {services.map((service, index) => (
                    <div
                      key={index}
                      className="flex flex-wrap sm:flex-nowrap items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div className="flex-1 min-w-[140px]">
                        <Input
                          placeholder="Service name"
                          value={service.name}
                          onChange={(e) =>
                            updateService(index, 'name', e.target.value)
                          }
                        />
                      </div>
                      <div className="w-28">
                        <Input
                          placeholder="₹ Price"
                          type="number"
                          value={service.price}
                          onChange={(e) =>
                            updateService(index, 'price', e.target.value)
                          }
                        />
                      </div>
                      <div className="w-24">
                        <Input
                          placeholder="Min"
                          type="number"
                          value={service.duration}
                          onChange={(e) =>
                            updateService(index, 'duration', e.target.value)
                          }
                        />
                      </div>
                      {services.length > 1 && (
                        <button
                          onClick={() => removeService(index)}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors mt-0.5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addService}
                  className="mt-3 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add another service
                </button>
              </div>

              {/* Working Hours */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Working Hours
                </label>
                <div className="space-y-2">
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="flex items-center gap-3 py-2"
                    >
                      <button
                        onClick={() => toggleDay(day)}
                        className={clsx(
                          'w-10 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0',
                          workingHours[day].isOpen
                            ? 'bg-indigo-600'
                            : 'bg-slate-300'
                        )}
                      >
                        <span
                          className={clsx(
                            'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
                            workingHours[day].isOpen
                              ? 'translate-x-[18px]'
                              : 'translate-x-0.5'
                          )}
                        />
                      </button>
                      <span className="text-sm font-medium text-slate-700 w-24 capitalize">
                        {day}
                      </span>
                      {workingHours[day].isOpen && (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={workingHours[day].open}
                            onChange={(e) =>
                              updateDayHours(day, 'open', e.target.value)
                            }
                            className="px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          />
                          <span className="text-slate-400 text-sm">to</span>
                          <input
                            type="time"
                            value={workingHours[day].close}
                            onChange={(e) =>
                              updateDayHours(day, 'close', e.target.value)
                            }
                            className="px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          />
                        </div>
                      )}
                      {!workingHours[day].isOpen && (
                        <span className="text-sm text-slate-400">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Your preferences
              </h2>
              <p className="text-sm text-slate-500 mb-8">
                Set up your communication & payment preferences
              </p>

              <div className="space-y-6">
                <Input
                  label="WhatsApp Business Number"
                  id="whatsapp"
                  placeholder="+91 98765 43210"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                />

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Primary Payment Method
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PAYMENT_METHODS.map((pm) => (
                      <button
                        key={pm.value}
                        onClick={() => setPaymentMethod(pm.value)}
                        className={clsx(
                          'px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200',
                          paymentMethod === pm.value
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        )}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    AI Message Language
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setLanguage('english')}
                      className={clsx(
                        'flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200',
                        language === 'english'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      )}
                    >
                      🇬🇧 English
                    </button>
                    <button
                      onClick={() => setLanguage('hinglish')}
                      className={clsx(
                        'flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200',
                        language === 'hinglish'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      )}
                    >
                      🇮🇳 Hinglish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Goals */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                What are your goals?
              </h2>
              <p className="text-sm text-slate-500 mb-8">
                Select what you want BizPilot AI to focus on
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BUSINESS_GOALS.map((goal) => {
                  const isSelected = goals.includes(goal.value);
                  return (
                    <button
                      key={goal.value}
                      onClick={() => toggleGoal(goal.value)}
                      className={clsx(
                        'flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-200 text-left',
                        'hover:shadow-sm',
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <span className="text-3xl">{goal.emoji}</span>
                      <div className="flex-1">
                        <span
                          className={clsx(
                            'text-sm font-semibold block',
                            isSelected ? 'text-indigo-700' : 'text-slate-800'
                          )}
                        >
                          {goal.label}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="ghost"
            onClick={() => setStep(step - 1)}
            className={clsx(step === 0 && 'invisible')}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              size="lg"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceed()}
              isLoading={loading}
              size="lg"
              className="gap-2"
            >
              Launch BizPilot AI 🚀
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
