'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { type Service, type Staff, type MessageTemplate } from '@/lib/types';
import { mockBusiness, mockStaff, mockMessageTemplates } from '@/lib/mock-data';
import { BUSINESS_TYPES, PAYMENT_METHODS } from '@/lib/constants';
import { formatCurrency, generateId } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import Avatar from '@/components/ui/Avatar';
import { useToast } from '@/contexts/ToastContext';
import {
  Settings,
  Building2,
  Wrench,
  Users,
  FileText,
  CreditCard,
  Languages,
  Save,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Phone,
  Mail,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
  Smartphone,
  Globe,
  Sparkles,
  X,
} from 'lucide-react';

const SETTINGS_TABS = [
  { id: 'business', label: 'Business Profile', icon: <Building2 className="h-4 w-4" /> },
  { id: 'services', label: 'Services', icon: <Wrench className="h-4 w-4" /> },
  { id: 'staff', label: 'Staff', icon: <Users className="h-4 w-4" /> },
  { id: 'templates', label: 'Templates', icon: <FileText className="h-4 w-4" /> },
  { id: 'payments', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'language', label: 'Language', icon: <Languages className="h-4 w-4" /> },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('business');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-indigo-600" />
            Settings
          </h1>
          <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider select-none shrink-0" title="Data is local and simulated for this MVP preview">
            Demo Mode
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-0.5">Manage your business configuration</p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={SETTINGS_TABS.map((t) => ({ value: t.id, label: t.label }))}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'business' && <BusinessProfileTab />}
        {activeTab === 'services' && <ServicesTab />}
        {activeTab === 'staff' && <StaffTab />}
        {activeTab === 'templates' && <TemplatesTab />}
        {activeTab === 'payments' && <PaymentsTab />}
        {activeTab === 'language' && <LanguageTab />}
      </div>
    </div>
  );
}

/* ============================================================
   Business Profile Tab
   ============================================================ */
function BusinessProfileTab() {
  const { showToast } = useToast();
  const [name, setName] = useState(mockBusiness.name);
  const [type, setType] = useState(mockBusiness.type);
  const [whatsapp, setWhatsapp] = useState(mockBusiness.whatsappNumber);
  const [address, setAddress] = useState('123, MG Road, Pune, Maharashtra 411001');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(mockBusiness.name);
    setType(mockBusiness.type);
    setWhatsapp(mockBusiness.whatsappNumber);
  }, []);

  function handleSave() {
    mockBusiness.name = name;
    mockBusiness.type = type;
    mockBusiness.whatsappNumber = whatsapp;
    if (typeof window !== 'undefined') {
      localStorage.setItem('bizpilot_business', JSON.stringify(mockBusiness));
    }
    setSaved(true);
    showToast('Business profile updated successfully! (Demo Mode)', 'success');
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 max-w-2xl">
      <h2 className="text-lg font-semibold text-slate-900 mb-6">Business Profile</h2>
      <div className="space-y-5">
        <Input
          label="Business Name"
          id="business-name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        />
        <Select
          label="Business Type"
          options={BUSINESS_TYPES.map((bt) => ({ value: bt.value, label: `${bt.emoji} ${bt.label}` }))}
          value={type}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value as typeof type)}
        />
        <Input
          label="WhatsApp Number"
          id="whatsapp"
          value={whatsapp}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWhatsapp(e.target.value)}
        />
        <Input
          label="Business Address"
          id="address"
          value={address}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
        />

        <div className="pt-4 flex items-center gap-3">
          <Button variant="primary" onClick={handleSave}>
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1.5" />
                Save Changes
              </>
            )}
          </Button>
          {saved && <span className="text-sm text-emerald-600">Changes saved successfully</span>}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Services Tab
   ============================================================ */
function ServicesTab() {
  const { showToast } = useToast();
  const [services, setServices] = useState<Service[]>(mockBusiness.services);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDuration, setNewDuration] = useState('60');

  useEffect(() => {
    mockBusiness.services = services;
    if (typeof window !== 'undefined') {
      localStorage.setItem('bizpilot_business', JSON.stringify(mockBusiness));
    }
  }, [services]);

  function handleAdd() {
    if (!newName || !newPrice) return;
    const svc: Service = {
      id: `svc-${generateId()}`,
      name: newName,
      price: Number(newPrice),
      duration: Number(newDuration),
    };
    setServices((prev) => [...prev, svc]);
    setNewName('');
    setNewPrice('');
    setNewDuration('60');
    setIsAddOpen(false);
    showToast(`Service "${newName}" added successfully! (Demo Mode)`, 'success');
  }

  function handleDelete(id: string) {
    const svc = services.find((s) => s.id === id);
    setServices((prev) => prev.filter((s) => s.id !== id));
    showToast(`Service "${svc?.name || ''}" removed. (Demo Mode)`, 'warning');
  }

  function handleUpdate() {
    if (!editService) return;
    setServices((prev) =>
      prev.map((s) => (s.id === editService.id ? editService : s))
    );
    showToast(`Service "${editService.name}" updated successfully! (Demo Mode)`, 'success');
    setEditService(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Services</h2>
        <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Service
        </Button>
      </div>

      <div className="space-y-3">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-sm transition-shadow"
          >
            <div>
              <h3 className="font-semibold text-slate-900">{svc.name}</h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                <span className="font-medium text-indigo-600">{formatCurrency(svc.price)}</span>
                <span>·</span>
                <span>{svc.duration} min</span>
                {svc.description && (
                  <>
                    <span>·</span>
                    <span className="truncate max-w-[200px]">{svc.description}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => setEditService({ ...svc })}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(svc.id)}>
                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Service Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Service">
        <div className="space-y-4">
          <Input
            label="Service Name"
            id="svc-name"
            value={newName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
            placeholder="e.g., JEE Coaching"
          />
          <Input
            label="Price (₹)"
            id="svc-price"
            type="number"
            value={newPrice}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPrice(e.target.value)}
            placeholder="0"
          />
          <Select
            label="Duration"
            options={[
              { value: '30', label: '30 minutes' },
              { value: '45', label: '45 minutes' },
              { value: '60', label: '60 minutes' },
              { value: '90', label: '90 minutes' },
              { value: '120', label: '120 minutes' },
            ]}
            value={newDuration}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewDuration(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-1" />
              Add Service
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Service Modal */}
      <Modal isOpen={!!editService} onClose={() => setEditService(null)} title="Edit Service">
        {editService && (
          <div className="space-y-4">
            <Input
              label="Service Name"
              id="edit-svc-name"
              value={editService.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditService({ ...editService, name: e.target.value })
              }
            />
            <Input
              label="Price (₹)"
              id="edit-svc-price"
              type="number"
              value={String(editService.price)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditService({ ...editService, price: Number(e.target.value) })
              }
            />
            <Select
              label="Duration"
              options={[
                { value: '30', label: '30 minutes' },
                { value: '45', label: '45 minutes' },
                { value: '60', label: '60 minutes' },
                { value: '90', label: '90 minutes' },
                { value: '120', label: '120 minutes' },
              ]}
              value={String(editService.duration)}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setEditService({ ...editService, duration: Number(e.target.value) })
              }
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setEditService(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleUpdate}>
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ============================================================
   Staff Tab
   ============================================================ */
function StaffTab() {
  const { showToast } = useToast();
  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');

  function toggleActive(id: string) {
    const member = staff.find((m) => m.id === id);
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
    showToast(`Staff member "${member?.name || ''}" status changed. (Demo Mode)`, 'info');
  }

  function handleAdd() {
    if (!newStaffName || !newStaffEmail) return;
    const s: Staff = {
      id: `staff-${generateId()}`,
      name: newStaffName,
      email: newStaffEmail,
      phone: newStaffPhone,
      role: 'staff',
      services: [],
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setStaff((prev) => [...prev, s]);
    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffPhone('');
    setIsAddOpen(false);
    showToast(`Staff member "${newStaffName}" added successfully! (Demo Mode)`, 'success');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Staff Members</h2>
        <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Staff
        </Button>
      </div>

      <div className="space-y-3">
        {staff.map((s) => (
          <div
            key={s.id}
            className={clsx(
              'rounded-xl border bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all',
              s.isActive ? 'border-slate-200' : 'border-slate-100 opacity-60'
            )}
          >
            <div className="flex items-center gap-4">
              <Avatar name={s.name} size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{s.name}</h3>
                  <Badge className={s.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {s.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {s.phone}
                  </span>
                </div>
                {s.services.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {s.services.map((svc) => (
                      <span
                        key={svc}
                        className="text-xs bg-indigo-50 text-indigo-600 rounded-full px-2 py-0.5"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => toggleActive(s.id)}
              className="shrink-0 self-start sm:self-center"
            >
              {s.isActive ? (
                <ToggleRight className="h-8 w-8 text-emerald-500" />
              ) : (
                <ToggleLeft className="h-8 w-8 text-slate-300" />
              )}
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Staff Member">
        <div className="space-y-4">
          <Input
            label="Name"
            id="staff-name"
            value={newStaffName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStaffName(e.target.value)}
            placeholder="Full name"
          />
          <Input
            label="Email"
            id="staff-email"
            type="email"
            value={newStaffEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStaffEmail(e.target.value)}
            placeholder="email@example.com"
          />
          <Input
            label="Phone"
            id="staff-phone"
            value={newStaffPhone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStaffPhone(e.target.value)}
            placeholder="+91 98765 43210"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-1" />
              Add Staff
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ============================================================
   Templates Tab
   ============================================================ */
function TemplatesTab() {
  const { showToast } = useToast();
  const [templates] = useState<MessageTemplate[]>(mockMessageTemplates);

  function getChannelBadge(channel: string) {
    const styles: Record<string, string> = {
      whatsapp: 'bg-emerald-100 text-emerald-700',
      sms: 'bg-blue-100 text-blue-700',
      email: 'bg-purple-100 text-purple-700',
    };
    const icons: Record<string, React.ReactNode> = {
      whatsapp: <MessageSquare className="h-3 w-3" />,
      sms: <Smartphone className="h-3 w-3" />,
      email: <Mail className="h-3 w-3" />,
    };
    return (
      <Badge className={styles[channel] || 'bg-slate-100 text-slate-600'}>
        <span className="flex items-center gap-1">
          {icons[channel]}
          {channel.charAt(0).toUpperCase() + channel.slice(1)}
        </span>
      </Badge>
    );
  }

  function getCategoryBadge(category: string) {
    return (
      <Badge className="bg-indigo-100 text-indigo-700">
        {category
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')}
      </Badge>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Message Templates</h2>
      </div>

      <div className="space-y-3">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-900">{tpl.name}</h3>
                  {getChannelBadge(tpl.channel)}
                  {getCategoryBadge(tpl.category)}
                </div>
                <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {tpl.body}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={() => showToast(`Template editing simulated (Demo Mode)`, 'info')}
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Payments Tab
   ============================================================ */
function PaymentsTab() {
  const { showToast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState(mockBusiness.paymentMethod);
  const [upiId, setUpiId] = useState(mockBusiness.upiId || 'deshraj@upi');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    mockBusiness.paymentMethod = selectedMethod;
    mockBusiness.upiId = upiId;
    if (typeof window !== 'undefined') {
      localStorage.setItem('bizpilot_business', JSON.stringify(mockBusiness));
    }
    setSaved(true);
    showToast('UPI settings saved successfully! (Demo Mode)', 'success');
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Payment Settings</h2>

      <div className="space-y-3">
        {PAYMENT_METHODS.map((method) => {
          const isComingSoon = method.value === 'razorpay' || method.value === 'stripe';
          return (
            <button
              key={method.value}
              onClick={() => {
                if (!isComingSoon) {
                  setSelectedMethod(method.value);
                  mockBusiness.paymentMethod = method.value;
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('bizpilot_business', JSON.stringify(mockBusiness));
                  }
                }
              }}
              disabled={isComingSoon}
              className={clsx(
                'w-full rounded-xl border p-4 text-left transition-all flex items-center justify-between',
                selectedMethod === method.value
                  ? 'border-indigo-300 bg-indigo-50 ring-2 ring-indigo-100'
                  : isComingSoon
                  ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={clsx(
                    'h-4 w-4 rounded-full border-2 flex items-center justify-center',
                    selectedMethod === method.value
                      ? 'border-indigo-600'
                      : 'border-slate-300'
                  )}
                >
                  {selectedMethod === method.value && (
                    <div className="h-2 w-2 rounded-full bg-indigo-600" />
                  )}
                </div>
                <span
                  className={clsx(
                    'font-medium',
                    selectedMethod === method.value ? 'text-indigo-900' : 'text-slate-700'
                  )}
                >
                  {method.label}
                </span>
              </div>
              {isComingSoon && (
                <Badge className="bg-indigo-100 text-indigo-600">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Coming Soon
                  </span>
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {selectedMethod === 'upi' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <h3 className="font-medium text-slate-900">UPI Settings</h3>
          <Input
            label="UPI ID"
            id="upi-id"
            value={upiId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUpiId(e.target.value)}
            placeholder="yourname@upi"
          />
          <Button variant="primary" size="sm" onClick={handleSave}>
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save
              </>
            )}
          </Button>
        </div>
      )}

      {(selectedMethod === 'razorpay' || selectedMethod === 'stripe') && (
        <div className="rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 p-8 text-center">
          <CreditCard className="h-10 w-10 text-indigo-400 mx-auto mb-3" />
          <h3 className="font-semibold text-indigo-900">
            {selectedMethod === 'razorpay' ? 'Razorpay' : 'Stripe'} Integration
          </h3>
          <p className="text-sm text-indigo-600 mt-1">Coming soon! We&apos;re working on seamless payment integration.</p>
          <Button
            variant="outline"
            className="mt-4"
            size="sm"
            onClick={() => showToast(`${selectedMethod === 'razorpay' ? 'Razorpay' : 'Stripe'} integration simulated (Demo Mode)`, 'info')}
          >
            Connect {selectedMethod === 'razorpay' ? 'Razorpay' : 'Stripe'}
          </Button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Language Tab
   ============================================================ */
function LanguageTab() {
  const { showToast } = useToast();
  const [language, setLanguage] = useState<'english' | 'hinglish'>(mockBusiness.language);

  const englishPreview = `Hi Priya! 👋 Thank you for your interest in JEE Coaching. We'd love to tell you more about our program. When would be a good time to chat?`;
  const hinglishPreview = `Hi Priya! 🙏 Aapne JEE Coaching ke baare mein puchha tha. Bas follow up kar raha tha! Humari next batch jaldi start ho rahi hai. Koi bhi sawaal ho toh poochiye! 😊`;

  const handleLanguageChange = (lang: 'english' | 'hinglish') => {
    setLanguage(lang);
    mockBusiness.language = lang;
    if (typeof window !== 'undefined') {
      localStorage.setItem('bizpilot_business', JSON.stringify(mockBusiness));
    }
    showToast(`Language preference set to ${lang.toUpperCase()}! (Demo Mode)`, 'success');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Language & Tone Preferences</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => handleLanguageChange('english')}
          className={clsx(
            'rounded-xl border p-5 text-left transition-all',
            language === 'english'
              ? 'border-indigo-300 bg-indigo-50 ring-2 ring-indigo-100'
              : 'border-slate-200 bg-white hover:border-slate-300'
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <Globe className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-900">English</h3>
            {language === 'english' && (
              <CheckCircle2 className="h-4 w-4 text-indigo-600 ml-auto" />
            )}
          </div>
          <p className="text-sm text-slate-500">Professional English tone for messages and templates</p>
        </button>

        <button
          onClick={() => handleLanguageChange('hinglish')}
          className={clsx(
            'rounded-xl border p-5 text-left transition-all',
            language === 'hinglish'
              ? 'border-indigo-300 bg-indigo-50 ring-2 ring-indigo-100'
              : 'border-slate-200 bg-white hover:border-slate-300'
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl">🇮🇳</span>
            <h3 className="font-semibold text-slate-900">Hinglish</h3>
            {language === 'hinglish' && (
              <CheckCircle2 className="h-4 w-4 text-indigo-600 ml-auto" />
            )}
          </div>
          <p className="text-sm text-slate-500">Mix of Hindi and English — casual and relatable</p>
        </button>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-indigo-600" />
          Message Preview
        </h3>
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">
              WhatsApp Preview
            </span>
          </div>
          <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
            {language === 'english' ? englishPreview : hinglishPreview}
          </p>
        </div>
      </div>
    </div>
  );
}
