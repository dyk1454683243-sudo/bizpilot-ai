// ============================================================
// BizPilot AI — TypeScript Type Definitions
// ============================================================

export type UserRole = 'owner' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  businessId: string;
  createdAt: string;
}

export type BusinessType =
  | 'coaching_center'
  | 'clinic'
  | 'salon'
  | 'repair_shop'
  | 'agency'
  | 'consultant'
  | 'real_estate'
  | 'fitness_trainer'
  | 'other';

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  services: Service[];
  workingHours: WorkingHours;
  whatsappNumber: string;
  paymentMethod: string;
  language: 'english' | 'hinglish';
  goals: string[];
  ownerId: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description?: string;
}

export interface WorkingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  open: string; // "09:00"
  close: string; // "18:00"
}

export type LeadStatus = 'new' | 'contacted' | 'hot' | 'booked' | 'paid' | 'lost';
export type LeadSource = 'whatsapp' | 'website' | 'instagram' | 'referral' | 'manual';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: LeadStatus;
  source: LeadSource;
  score: number; // 0–100 AI lead score
  notes: string;
  serviceInterested?: string;
  assignedTo?: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  activities: LeadActivity[];
  createdAt: string;
  updatedAt: string;
}

export type ActivityType =
  | 'created'
  | 'contacted'
  | 'note_added'
  | 'status_changed'
  | 'follow_up_scheduled'
  | 'appointment_booked'
  | 'invoice_sent'
  | 'payment_received'
  | 'review_requested'
  | 'ai_message_generated';

export interface LeadActivity {
  id: string;
  leadId: string;
  type: ActivityType;
  description: string;
  createdAt: string;
  createdBy?: string;
}

export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  service: string;
  date: string; // "2026-05-21"
  time: string; // "10:00"
  duration: number; // minutes
  status: AppointmentStatus;
  notes?: string;
  reminderSent: boolean;
  createdAt: string;
}

export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  service: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
}

export type ReviewStatus = 'requested' | 'completed';

export interface Review {
  id: string;
  leadId: string;
  leadName: string;
  service: string;
  rating: number; // 1–5
  comment: string;
  status: ReviewStatus;
  requestedAt: string;
  completedAt?: string;
}

export interface AIReport {
  id: string;
  date: string;
  summary: string;
  newLeads: number;
  followUpsNeeded: number;
  hotLeads: string[];
  missedRevenue: number;
  suggestedActions: string[];
  conversionRate: number;
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'staff';
  services: string[];
  isActive: boolean;
  createdAt: string;
}

export type MessageChannel = 'whatsapp' | 'sms' | 'email';
export type MessageTone = 'professional' | 'friendly' | 'hinglish' | 'short' | 'persuasive';

export interface MessageTemplate {
  id: string;
  name: string;
  channel: MessageChannel;
  tone: MessageTone;
  subject?: string;
  body: string;
  category: 'follow_up' | 'appointment_reminder' | 'invoice' | 'review_request' | 'welcome';
  createdAt: string;
}

export interface DashboardStats {
  totalLeads: number;
  hotLeads: number;
  pendingFollowUps: number;
  todaysAppointments: number;
  revenueCollected: number;
  missedOpportunities: number;
  aiBusinessScore: number;
}

export type ToneOption = {
  value: MessageTone;
  label: string;
  emoji: string;
};

export interface OnboardingData {
  businessName: string;
  businessType: BusinessType;
  services: { name: string; price: number; duration: number }[];
  workingHours: WorkingHours;
  whatsappNumber: string;
  paymentMethod: string;
  language: 'english' | 'hinglish';
  goals: string[];
}
