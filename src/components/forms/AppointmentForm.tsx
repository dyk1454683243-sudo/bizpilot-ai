'use client';

import { useState, useEffect } from 'react';
import { type Appointment, type Lead } from '@/lib/types';
import { fetchLeads } from '@/lib/leads-db';
import { generateId } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Calendar, Clock, User, FileText } from 'lucide-react';

interface AppointmentFormProps {
  onSubmit: (appointment: Appointment) => void;
  onClose: () => void;
  initialData?: Appointment;
}

export default function AppointmentForm({ onSubmit, onClose, initialData }: AppointmentFormProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadId, setLeadId] = useState(initialData?.leadId || '');
  const [service, setService] = useState(initialData?.service || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [time, setTime] = useState(initialData?.time || '');
  const [duration, setDuration] = useState(String(initialData?.duration || '60'));
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadLeads() {
      try {
        const data = await fetchLeads();
        setLeads(data);
      } catch (err) {
        console.error('Failed to load leads in form:', err);
      }
    }
    loadLeads();
  }, []);

  const leadOptions = leads.map((lead) => ({
    value: lead.id,
    label: lead.name,
  }));

  const durationOptions = [
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '60 minutes' },
    { value: '90', label: '90 minutes' },
  ];

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!leadId) newErrors.leadId = 'Please select a lead';
    if (!date) newErrors.date = 'Please select a date';
    if (!time) newErrors.time = 'Please select a time';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const selectedLead = leads.find((l) => l.id === leadId);
    const appointment: Appointment = {
      id: initialData?.id || `apt-${generateId()}`,
      leadId,
      leadName: selectedLead?.name || '',
      leadPhone: selectedLead?.phone || '',
      service: service || selectedLead?.serviceInterested || '',
      date,
      time,
      duration: Number(duration),
      status: initialData?.status || 'pending',
      notes: notes || undefined,
      reminderSent: initialData?.reminderSent || false,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    onSubmit(appointment);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Select
        label="Lead"
        options={[{ value: '', label: 'Select a lead...' }, ...leadOptions]}
        value={leadId}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLeadId(e.target.value)}
        error={errors.leadId}
      />

      <div className="relative">
        <Input
          label="Service"
          id="service"
          placeholder="e.g., JEE Coaching - Demo Class"
          value={service}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setService(e.target.value)}
        />
        <FileText className="absolute right-3 top-9 h-4 w-4 text-slate-400 pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Date"
          id="date"
          type="date"
          value={date}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
          error={errors.date}
        />
        <Input
          label="Time"
          id="time"
          type="time"
          value={time}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTime(e.target.value)}
          error={errors.time}
        />
      </div>

      <Select
        label="Duration"
        options={durationOptions}
        value={duration}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDuration(e.target.value)}
      />

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1.5">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
          placeholder="Any additional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          <User className="h-4 w-4 mr-1.5" />
          {initialData ? 'Update Appointment' : 'Book Appointment'}
        </Button>
      </div>
    </form>
  );
}
