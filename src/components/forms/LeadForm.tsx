"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { LEAD_STATUSES, LEAD_SOURCES } from "@/lib/constants";
import { type Lead, type LeadStatus, type LeadSource } from "@/lib/types";
import { isValidIndianPhoneNumber } from "@/lib/utils";

interface LeadFormProps {
  onSubmit: (lead: Partial<Lead>) => void;
  onClose: () => void;
  initialData?: Lead;
}

export default function LeadForm({
  onSubmit,
  onClose,
  initialData,
}: LeadFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [source, setSource] = useState<LeadSource>(
    initialData?.source ?? "manual",
  );
  const [status, setStatus] = useState<LeadStatus>(
    initialData?.status ?? "new",
  );
  const [serviceInterested, setServiceInterested] = useState(
    initialData?.serviceInterested ?? "",
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  function validate(): boolean {
    const errs: { name?: string; phone?: string } = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!isValidIndianPhoneNumber(phone)) {
      errs.phone = "Phone number must be 10 digits";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const cleanPhone = phone.replace(/\s/g, "");
    const phoneNumber = cleanPhone.startsWith("+91")
      ? cleanPhone.substring(3)
      : cleanPhone;
    const formattedPhone = `+91 ${phoneNumber.substring(
      0,
      5,
    )} ${phoneNumber.substring(5)}`;
    onSubmit({
      ...(initialData && { id: initialData.id }),
      name: name.trim(),
      phone: formattedPhone,
      email: email.trim() || undefined,
      source,
      status,
      serviceInterested: serviceInterested.trim() || undefined,
      notes: notes.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <Input
        id="lead-name"
        label="Name *"
        placeholder="Enter lead name"
        value={name}
        onChange={(e) => setName((e.target as HTMLInputElement).value)}
        error={errors.name}
      />

      {/* Phone */}
      <Input
        id="lead-phone"
        label="Phone *"
        placeholder="+91 98765 43210"
        type="tel"
        value={phone}
        onChange={(e) => {
          const value = (e.target as HTMLInputElement).value;
          const filteredValue = value.replace(/[^0-9+\s]/g, "");
          setPhone(filteredValue);
        }}
        error={errors.phone}
      />

      {/* Email */}
      <Input
        id="lead-email"
        label="Email"
        placeholder="email@example.com"
        type="email"
        value={email}
        onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
      />

      {/* Source & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Source"
          value={source}
          onChange={(e) =>
            setSource((e.target as HTMLSelectElement).value as LeadSource)
          }
          options={LEAD_SOURCES.map((s) => ({
            value: s.value,
            label: `${s.icon} ${s.label}`,
          }))}
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) =>
            setStatus((e.target as HTMLSelectElement).value as LeadStatus)
          }
          options={LEAD_STATUSES.map((s) => ({
            value: s.value,
            label: s.label,
          }))}
        />
      </div>

      {/* Service Interested */}
      <Input
        id="lead-service"
        label="Service Interested"
        placeholder="e.g. JEE Coaching"
        value={serviceInterested}
        onChange={(e) =>
          setServiceInterested((e.target as HTMLInputElement).value)
        }
      />

      {/* Notes */}
      <div>
        <label
          htmlFor="lead-notes"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Notes
        </label>
        <textarea
          id="lead-notes"
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow resize-none"
          placeholder="Any additional notes about this lead..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? "Update Lead" : "Add Lead"}
        </Button>
      </div>
    </form>
  );
}
