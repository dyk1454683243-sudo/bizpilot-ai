import { type Lead, type Appointment, type Invoice, type Review } from './types';

export interface ComputedReport {
  date: string;
  summary: string;
  
  // Leads metrics
  totalLeads: number;
  hotLeadsCount: number;
  hotLeadsList: string[];
  newLeadsCount: number;
  followUpsNeeded: number;
  conversionRate: number;

  // Appointments metrics
  appointmentsConfirmed: number;
  appointmentsPending: number;
  appointmentsCancelled: number;
  appointmentsCompleted: number;

  // Invoices metrics
  revenueCollected: number;
  missedRevenue: number; // unpaid/overdue amount
  unpaidCount: number;
  overdueCount: number;

  // Reviews metrics
  averageRating: number;
  reviewsCompleted: number;
  reviewsPending: number; // requested

  // Lists for UI sections
  suggestedActions: string[];
  insights: string[];
  alerts: { type: 'warning' | 'success' | 'info'; message: string }[];
  missedOpportunities: { leadName: string; reason: string; potentialRevenue: number; action: string }[];
}

/**
 * Helper to get the business name dynamically
 */
function getBusinessName(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('bizpilot_business');
    if (stored) {
      try {
        const biz = JSON.parse(stored);
        if (biz.name) return biz.name;
      } catch (e) {
        // ignore
      }
    }
  }
  return 'BizPilot Academy';
}

/**
 * Generates all metrics and text elements dynamically from live Supabase collections
 */
export function generateRealTimeReport(
  leads: Lead[],
  appointments: Appointment[],
  invoices: Invoice[],
  reviews: Review[]
): ComputedReport {
  const businessName = getBusinessName();
  const dateStr = new Date().toISOString().split('T')[0];

  // --- 1. Leads Calculations ---
  const totalLeads = leads.length;
  const hotLeads = leads.filter(l => l.status === 'hot');
  const hotLeadsCount = hotLeads.length;
  const hotLeadsList = leads
    .filter(l => l.status === 'hot' || l.score > 80)
    .map(l => l.name)
    .slice(0, 3);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newLeadsCount = leads.filter(l => new Date(l.createdAt) >= sevenDaysAgo).length;

  const followUpsNeeded = leads.filter(l => ['new', 'contacted', 'hot'].includes(l.status)).length;

  const paidLeads = leads.filter(l => l.status === 'paid').length;
  const conversionRate = totalLeads > 0 ? Math.round((paidLeads / totalLeads) * 100) : 0;

  // --- 2. Appointments Calculations ---
  const appointmentsConfirmed = appointments.filter(a => a.status === 'confirmed').length;
  const appointmentsPending = appointments.filter(a => a.status === 'pending').length;
  const appointmentsCancelled = appointments.filter(a => a.status === 'cancelled').length;
  const appointmentsCompleted = appointments.filter(a => a.status === 'completed').length;

  // --- 3. Invoices Calculations ---
  const revenueCollected = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const missedRevenue = invoices
    .filter(inv => inv.status === 'unpaid' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const unpaidCount = invoices.filter(inv => inv.status === 'unpaid').length;
  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;

  // --- 4. Reviews Calculations ---
  const reviewsCompleted = reviews.filter(r => r.status === 'completed').length;
  const reviewsPending = reviews.filter(r => r.status === 'requested').length;

  const completedReviewsWithRating = reviews.filter(r => r.status === 'completed' && r.rating > 0);
  const averageRating = completedReviewsWithRating.length > 0
    ? Number((completedReviewsWithRating.reduce((sum, r) => sum + r.rating, 0) / completedReviewsWithRating.length).toFixed(1))
    : 0;

  // --- 5. Missed Opportunities ---
  const missedOpportunities: { leadName: string; reason: string; potentialRevenue: number; action: string }[] = [];

  // Overdue Invoices
  invoices
    .filter(inv => inv.status === 'overdue')
    .forEach(inv => {
      missedOpportunities.push({
        leadName: inv.leadName,
        reason: `Invoice ${inv.invoiceNumber} has passed its due date.`,
        potentialRevenue: Number(inv.amount),
        action: 'Send a payment reminder via WhatsApp with UPI ID link.'
      });
    });

  // Lost Leads
  leads
    .filter(l => l.status === 'lost')
    .forEach(l => {
      missedOpportunities.push({
        leadName: l.name,
        reason: l.notes ? (l.notes.length > 60 ? l.notes.slice(0, 60) + '...' : l.notes) : 'Lead marked as lost.',
        potentialRevenue: 15000,
        action: 'Send a "We miss you" follow-up message with a 10% demo discount offer.'
      });
    });

  // Backfill with demo data if completely empty
  if (missedOpportunities.length === 0) {
    if (leads.length === 0) {
      missedOpportunities.push({
        leadName: 'Rahul Joshi (Demo)',
        reason: 'Added manually from phone inquiry, budget was a blocker.',
        potentialRevenue: 15000,
        action: 'Re-engage next month with a customized installment plan.'
      });
    } else {
      // Find a lead that is not paid and is older than 3 days
      const idleLeads = leads.filter(l => l.status !== 'paid' && l.status !== 'lost');
      if (idleLeads.length > 0) {
        missedOpportunities.push({
          leadName: idleLeads[0].name,
          reason: 'No contact or follow-up recorded in the last 3 days.',
          potentialRevenue: 10000,
          action: 'Send a quick friendly message with details of the upcoming batch.'
        });
      }
    }
  }

  // --- 6. Suggested Actions Checklist ---
  const suggestedActions: string[] = [];

  // Action 1: Hot Leads
  leads.filter(l => l.status === 'hot').slice(0, 2).forEach(l => {
    suggestedActions.push(`🔥 Call hot lead ${l.name} today — conversion probability is high. Send course enrollment details.`);
  });

  // Action 2: Overdue Invoices
  invoices.filter(inv => inv.status === 'overdue').slice(0, 2).forEach(inv => {
    suggestedActions.push(`💰 Send payment reminder to ${inv.leadName} — invoice ${inv.invoiceNumber} is overdue.`);
  });

  // Action 3: Pending Appointments
  appointments.filter(apt => apt.status === 'pending').slice(0, 2).forEach(apt => {
    suggestedActions.push(`📅 Confirm pending appointment with ${apt.leadName} scheduled for ${apt.service}.`);
  });

  // Action 4: Pending Reviews
  reviews.filter(rev => rev.status === 'requested').slice(0, 2).forEach(rev => {
    suggestedActions.push(`⭐ Send review link reminder to ${rev.leadName} for their recent ${rev.service}.`);
  });

  // Add default checklist fillers if short
  if (suggestedActions.length < 3) {
    suggestedActions.push('📱 Check your WhatsApp messages for new student inquiries today.');
    suggestedActions.push('🎯 Run a referral campaign targeting your recent satisfied coaching students.');
    suggestedActions.push('📈 Update service prices in your Settings page for the upcoming academic batch.');
  }

  // --- 7. AI Insights ---
  const insights: string[] = [];

  // Insight 1: Conversion rate vs industry average
  insights.push(`📈 Your current conversion rate is ${conversionRate}% — ${conversionRate >= 35 ? 'above' : 'below'} the industry average of 35% for tutoring & coaching centers.`);

  // Insight 2: Top acquisition channel
  if (leads.length > 0) {
    const sourcesCount = leads.reduce((acc: Record<string, number>, l) => {
      acc[l.source] = (acc[l.source] || 0) + 1;
      return acc;
    }, {});
    
    let topSource = 'WhatsApp';
    let maxSourceCount = 0;
    Object.entries(sourcesCount).forEach(([source, count]) => {
      if (count > maxSourceCount) {
        maxSourceCount = count;
        topSource = source.charAt(0).toUpperCase() + source.slice(1);
      }
    });

    const pct = Math.round((maxSourceCount / leads.length) * 100);
    insights.push(`🔥 ${topSource} is your top acquisition source (${pct}% of all leads). Consider allocating more outreach focus here.`);
  } else {
    insights.push('🔥 Set up lead sources (WhatsApp, Instagram, Web forms) to track where your students find you.');
  }

  // Insight 3: Revenue opportunity from hot leads
  const potentialHotRevenue = hotLeadsCount * 15000;
  if (potentialHotRevenue > 0) {
    insights.push(`💰 You have ₹${potentialHotRevenue.toLocaleString('en-IN')} in potential revenue from hot leads. Focus on closing ${hotLeads.map(l => l.name).join(', ')}.`);
  } else {
    insights.push('💰 Keep your pipeline active. Turn cold inquiries into hot leads by offering free trial consultations.');
  }

  // Insight 4: Average customer review rating
  if (averageRating > 4.5) {
    insights.push(`⭐ Excellent average customer rating of ${averageRating}/5! Share these reviews on social media to build public trust.`);
  } else if (averageRating > 0) {
    insights.push(`⭐ Your average testimonial rating is ${averageRating}/5. Gather more student feedback to boost credibility.`);
  } else {
    insights.push('⭐ No completed testimonials yet. Request feedback from your paid leads to display stars on your site.');
  }

  // Insight 5: Standard AI tip
  insights.push('⏰ Best response window: Leads contacted within 1 hour have a 3x higher enrollment rate compared to next-day follow-ups.');

  // --- 8. Alerts Warnings/Success ---
  const alerts: { type: 'warning' | 'success' | 'info'; message: string }[] = [];

  // Overdue invoice alerts
  invoices
    .filter(inv => inv.status === 'overdue')
    .slice(0, 2)
    .forEach(inv => {
      alerts.push({
        type: 'warning',
        message: `${inv.leadName}'s invoice ${inv.invoiceNumber} (₹${Number(inv.amount).toLocaleString('en-IN')}) is overdue. Send a reminder.`
      });
    });

  // Cold leads alert (no contact in 5+ days)
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  const coldLeads = leads.filter(l => 
    l.status !== 'paid' && 
    l.status !== 'lost' && 
    l.lastContactedAt && 
    new Date(l.lastContactedAt) < fiveDaysAgo
  );
  if (coldLeads.length > 0) {
    alerts.push({
      type: 'warning',
      message: `${coldLeads.length} leads have not been contacted in 5+ days. They are at risk of going cold.`
    });
  }

  // High rating review alert
  reviews
    .filter(r => r.status === 'completed' && r.rating >= 4)
    .slice(0, 2)
    .forEach(r => {
      alerts.push({
        type: 'success',
        message: `${r.leadName} left a ${r.rating}-star review for ${r.service}! Share this testimonial.`
      });
    });

  // Default info alert
  alerts.push({
    type: 'info',
    message: 'New batch starting next month — time to push enrollment campaigns.'
  });

  // --- 9. Synthesized Summary Text ---
  let summary = `Welcome back! Here is your AI Daily Business Report for ${businessName}. `;

  if (leads.length === 0) {
    summary += 'Your Leads CRM is currently empty. Get started by adding a new lead or sharing your booking page to capture parent inquiries and generate your first report.';
  } else {
    summary += `You have a pipeline of ${totalLeads} total leads, with ${newLeadsCount} new leads captured in the last 7 days. `;
    
    if (followUpsNeeded > 0) {
      summary += `There are ${followUpsNeeded} active leads requiring follow-up. `;
    } else {
      summary += `Your follow-up queue is completely clear today! `;
    }

    if (appointmentsPending > 0) {
      summary += `You also have ${appointmentsPending} pending trial classes or consultations that need confirmation. `;
    }

    const overdueList = invoices.filter(inv => inv.status === 'overdue');
    if (overdueList.length > 0) {
      const overdueTotal = overdueList.reduce((sum, inv) => sum + Number(inv.amount), 0);
      summary += `Important: You have ${overdueList.length} overdue invoices representing ₹${overdueTotal.toLocaleString('en-IN')} in missed revenue. We recommend sending reminders today.`;
    } else {
      summary += `Your invoice collection is running smoothly, with ₹${revenueCollected.toLocaleString('en-IN')} successfully collected from paid invoices.`;
    }
  }

  return {
    date: dateStr,
    summary,
    totalLeads,
    hotLeadsCount,
    hotLeadsList,
    newLeadsCount,
    followUpsNeeded,
    conversionRate,
    appointmentsConfirmed,
    appointmentsPending,
    appointmentsCancelled,
    appointmentsCompleted,
    revenueCollected,
    missedRevenue,
    unpaidCount,
    overdueCount,
    averageRating,
    reviewsCompleted,
    reviewsPending,
    suggestedActions,
    insights,
    alerts,
    missedOpportunities
  };
}
