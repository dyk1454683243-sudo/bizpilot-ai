// ============================================================
// BizPilot AI — Mock AI Service
// Simulates AI responses with realistic delays
// ============================================================

import { type MessageTone, type Lead } from './types';

/**
 * Simulate a network delay
 */
function delay(ms: number = 800): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
 * Generate a follow-up message for a lead
 */
export async function generateFollowUpMessage(
  leadName: string,
  service: string,
  tone: MessageTone,
  context?: string
): Promise<string> {
  await delay(1200);

  const businessName = getBusinessName();

  const messages: Record<MessageTone, string> = {
    professional: `Dear ${leadName},\n\nI hope this message finds you well. I wanted to follow up regarding your interest in our ${service} program.\n\nWe have limited seats available for our upcoming batch, and I believe this program would be an excellent fit based on our previous discussion${context ? ` about ${context}` : ''}.\n\nWould you be available for a brief call this week to discuss the next steps?\n\nBest regards,\n${businessName}`,

    friendly: `Hi ${leadName}! 😊\n\nJust checking in! We spoke about our ${service} program and I wanted to see if you had any more questions.\n\nOur students are already seeing amazing results, and we'd love for you to be part of our next batch! 🎯\n\nLet me know when you're free to chat. No pressure at all! 🙌`,

    hinglish: `Hi ${leadName}! 🙏\n\nAapne humari ${service} ke baare mein puchha tha. Bas follow up kar raha tha!\n\nHumari next batch jaldi start ho rahi hai aur seats limited hain. Agar aap interested hain toh jaldi baat kar lete hain.\n\nKoi bhi sawaal ho toh poochiye! 😊\n\n${businessName}`,

    short: `Hi ${leadName}, following up on ${service}. New batch starting soon — limited seats. Interested? Reply YES to know more.`,

    persuasive: `Hi ${leadName}! 🔥\n\nQuick update on our ${service} program — we just had 3 students from last batch crack their exams with top scores!\n\nI remember you were interested, and I don't want you to miss out. Our next batch starts soon and only 5 seats are left.\n\n📊 93% of our students show 40%+ improvement\n⭐ 4.8/5 average rating from parents\n🎯 Personal attention with small batch sizes\n\nShall I reserve a spot for you? Just say YES! 💪`,
  };

  return messages[tone] || messages.professional;
}

/**
 * Score a lead based on their data
 */
export async function scoreLead(lead: Lead): Promise<{
  score: number;
  factors: string[];
  recommendation: string;
}> {
  await delay(600);

  const factors: string[] = [];
  let score = 50;

  // Engagement factors
  if (lead.activities.length >= 3) {
    score += 15;
    factors.push('High engagement — multiple interactions recorded');
  }
  if (lead.source === 'referral') {
    score += 10;
    factors.push('Referral lead — higher trust and conversion potential');
  }
  if (lead.email) {
    score += 5;
    factors.push('Email provided — shows serious intent');
  }
  if (lead.status === 'hot') {
    score += 15;
    factors.push('Marked as hot lead — strong buying signals');
  }
  if (lead.status === 'booked') {
    score += 20;
    factors.push('Appointment booked — very close to conversion');
  }
  if (lead.notes && lead.notes.length > 50) {
    score += 5;
    factors.push('Detailed notes available — good context for follow-up');
  }

  // Recency factor
  if (lead.lastContactedAt) {
    const daysSinceContact = Math.floor(
      (Date.now() - new Date(lead.lastContactedAt).getTime()) / 86400000
    );
    if (daysSinceContact <= 1) {
      score += 10;
      factors.push('Recently contacted — momentum is high');
    } else if (daysSinceContact > 7) {
      score -= 10;
      factors.push('No contact in 7+ days — risk of going cold');
    }
  }

  score = Math.min(100, Math.max(0, score));

  const recommendations: Record<string, string> = {
    high: `${lead.name} is a high-priority lead! Call them today and close the deal. Send a personalized offer or schedule a demo.`,
    medium: `${lead.name} shows good potential. Follow up within 24 hours with a friendly message highlighting your unique value.`,
    low: `${lead.name} needs nurturing. Send an informational message or share a success story to re-engage their interest.`,
  };

  const level = score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low';

  return { score, factors, recommendation: recommendations[level] };
}

/**
 * Generate a daily business report
 */
export async function generateDailyReport(): Promise<{
  summary: string;
  insights: string[];
  alerts: { type: 'warning' | 'success' | 'info'; message: string }[];
}> {
  await delay(1500);

  return {
    summary:
      "Today was a productive day! You received 3 new leads and have 5 follow-ups pending. Your AI Business Score is 74/100 — there's room to improve by acting on overdue follow-ups and confirming tomorrow's appointments.",
    insights: [
      '📈 Your lead conversion rate is 42% — above industry average of 35% for coaching centers.',
      '🔥 WhatsApp is your top lead source (40% of all leads). Consider running more WhatsApp-focused campaigns.',
      '⏰ Best response time: leads contacted within 1 hour have 3x higher conversion rate.',
      '💰 You have ₹23,000 in potential revenue from hot leads. Focus on closing Priya Mehta and Kavita Nair.',
      '📅 Tomorrow you have 1 confirmed appointment. Consider scheduling follow-up calls in open slots.',
    ],
    alerts: [
      { type: 'warning', message: 'Sneha Reddy\'s invoice is overdue by 6 days. Send a payment reminder.' },
      { type: 'warning', message: '3 leads have not been contacted in 5+ days. They may go cold.' },
      { type: 'success', message: 'Ananya Gupta left a 5-star review! Share it on your social media.' },
      { type: 'info', message: 'New batch starting next month — time to push enrollment campaigns.' },
    ],
  };
}

/**
 * Suggest next best action for a lead
 */
export async function suggestNextAction(lead: Lead): Promise<string> {
  await delay(500);

  const actions: Record<string, string> = {
    new: `📱 Contact ${lead.name} within the next 2 hours. First response time is critical — leads contacted within 1 hour are 7x more likely to convert.`,
    contacted: `📝 Schedule a follow-up call with ${lead.name}. Send a WhatsApp message with course details and a special offer to create urgency.`,
    hot: `🔥 ${lead.name} is ready to convert! Call immediately and offer to book a demo class or enrollment meeting. Consider offering an early-bird discount.`,
    booked: `✅ Confirm ${lead.name}'s appointment and send a reminder 2 hours before. Prepare a welcome kit and enrollment form for the meeting.`,
    paid: `⭐ ${lead.name} has paid! Send a thank-you message and request a Google review. Also ask for referrals — happy customers are your best lead source.`,
    lost: `🔄 Don't give up on ${lead.name}. Wait 2 weeks, then send a "We miss you" message with a new offer or success story from a similar student.`,
  };

  return actions[lead.status] || actions.new;
}

/**
 * Generate a review request message
 */
export async function generateReviewRequest(
  leadName: string,
  service: string
): Promise<string> {
  await delay(800);

  const businessName = getBusinessName();

  return `Hi ${leadName}! 🌟\n\nThank you for choosing ${businessName} for ${service}. We hope you had a great experience!\n\nYour feedback helps us improve and helps other parents make informed decisions. Could you take just 60 seconds to share your experience?\n\n⭐⭐⭐⭐⭐\n\nTap here to leave a review: [Review Link]\n\nThank you so much! 🙏\n- Team ${businessName}`;
}

/**
 * Detect missed opportunities
 */
export async function detectMissedOpportunities(): Promise<
  { leadName: string; reason: string; potentialRevenue: number; action: string }[]
> {
  await delay(1000);

  return [
    {
      leadName: 'Rahul Joshi',
      reason: 'Lost to competitor due to pricing concerns',
      potentialRevenue: 15000,
      action: 'Consider a re-engagement offer with 10% early-bird discount',
    },
    {
      leadName: 'Deepak Verma',
      reason: 'No follow-up in 3 days — interest may be fading',
      potentialRevenue: 500,
      action: 'Send a quick WhatsApp check-in message today',
    },
    {
      leadName: 'Arjun Malhotra',
      reason: 'Walk-in inquiry with no follow-up scheduled',
      potentialRevenue: 15000,
      action: 'Call within 24 hours and offer a free demo class',
    },
  ];
}
