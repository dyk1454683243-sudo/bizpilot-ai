'use client';

import { useState, useMemo } from 'react';
import {
  Sparkles,
  Send,
  Copy,
  CheckCircle,
  MessageSquare,
  Mail,
  Smartphone,
  Clock,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import clsx from 'clsx';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Tabs from '@/components/ui/Tabs';

import { mockLeads, mockMessageTemplates } from '@/lib/mock-data';
import { TONE_OPTIONS } from '@/lib/constants';
import { timeAgo, getLeadStatusColor, getScoreColor } from '@/lib/utils';
import { generateFollowUpMessage } from '@/lib/mock-ai';
import type { Lead, MessageTone, MessageChannel } from '@/lib/types';

// ── Channel Config ──────────────────────────────────────────
const CHANNELS: { value: MessageChannel; label: string; icon: React.ReactNode }[] = [
  { value: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="h-4 w-4" /> },
  { value: 'sms', label: 'SMS', icon: <Smartphone className="h-4 w-4" /> },
  { value: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
];

// ── Template Category Tabs ──────────────────────────────────
const TEMPLATE_TABS = [
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'welcome', label: 'Welcome' },
  { value: 'appointment_reminder', label: 'Appointment' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'review_request', label: 'Review' },
];

export default function FollowUpsPage() {
  // Leads that need follow-up
  const pendingLeads = useMemo(
    () => mockLeads.filter((l) => l.status === 'new' || l.status === 'contacted' || l.status === 'hot'),
    []
  );

  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<MessageTone>('friendly');
  const [selectedChannel, setSelectedChannel] = useState<MessageChannel>('whatsapp');
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [followedUp, setFollowedUp] = useState<Set<string>>(new Set());
  const [templateTab, setTemplateTab] = useState('follow_up');

  // ── Generate message for a lead ───────────────────────────
  async function handleGenerate(lead: Lead) {
    setIsGenerating(true);
    setGeneratedMessage(null);
    const msg = await generateFollowUpMessage(
      lead.name,
      lead.serviceInterested ?? 'our services',
      selectedTone
    );
    setGeneratedMessage(msg);
    setIsGenerating(false);
  }

  // ── Copy to clipboard ────────────────────────────────────
  async function handleCopy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // ── Mark as followed up ───────────────────────────────────
  function handleMarkFollowedUp(leadId: string) {
    setFollowedUp((prev) => new Set(prev).add(leadId));
    setExpandedLeadId(null);
    setGeneratedMessage(null);
  }

  // ── Toggle expanded lead ──────────────────────────────────
  function toggleLead(leadId: string) {
    if (expandedLeadId === leadId) {
      setExpandedLeadId(null);
      setGeneratedMessage(null);
    } else {
      setExpandedLeadId(leadId);
      setGeneratedMessage(null);
    }
  }

  // ── Filter templates ──────────────────────────────────────
  const filteredTemplates = mockMessageTemplates.filter((t) => t.category === templateTab);

  return (
    <div className="space-y-8">
      {/* ── Header ────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-indigo-100">
            <Sparkles className="h-5 w-5 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">AI Follow-Up Agent</h1>
        </div>
        <p className="text-slate-500 mt-1.5 ml-[46px]">
          Generate personalized follow-up messages for your leads
        </p>
      </div>

      {/* ── Pending Follow-ups ────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          Pending Follow-ups
          <Badge className="bg-amber-100 text-amber-700 text-xs">{pendingLeads.length}</Badge>
        </h2>

        <div className="space-y-3">
          {pendingLeads.map((lead) => {
            const isExpanded = expandedLeadId === lead.id;
            const isDone = followedUp.has(lead.id);

            return (
              <Card
                key={lead.id}
                className={clsx(
                  'overflow-hidden transition-all duration-300',
                  isDone && 'opacity-60',
                  isExpanded && 'ring-2 ring-indigo-200'
                )}
              >
                {/* ── Lead Row ──────────────────────────── */}
                <button
                  onClick={() => toggleLead(lead.id)}
                  className={clsx(
                    'w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50/60 transition-colors',
                    isDone && 'line-through decoration-slate-300'
                  )}
                  disabled={isDone}
                >
                  <Avatar name={lead.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900">{lead.name}</span>
                      <Badge className={clsx('text-xs capitalize', getLeadStatusColor(lead.status))}>
                        {lead.status}
                      </Badge>
                      {isDone && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">✓ Followed Up</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-500">{lead.phone}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">{lead.serviceInterested || 'No service'}</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="text-right">
                      <span className={clsx('text-sm font-bold', getScoreColor(lead.score))}>{lead.score}</span>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Score</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">
                        {lead.lastContactedAt ? timeAgo(lead.lastContactedAt) : 'Never contacted'}
                      </span>
                    </div>
                  </div>
                  {!isDone && (
                    isExpanded
                      ? <ChevronUp className="h-5 w-5 text-slate-400 flex-shrink-0" />
                      : <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>

                {/* ── Expanded Composer ──────────────────── */}
                {isExpanded && !isDone && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-5">
                    {/* Tone Selector */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Message Tone
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {TONE_OPTIONS.map((tone) => (
                          <button
                            key={tone.value}
                            onClick={() => setSelectedTone(tone.value)}
                            className={clsx(
                              'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                              selectedTone === tone.value
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                            )}
                          >
                            {tone.emoji} {tone.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Channel Selector */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Channel
                      </p>
                      <div className="flex gap-2">
                        {CHANNELS.map((ch) => (
                          <button
                            key={ch.value}
                            onClick={() => setSelectedChannel(ch.value)}
                            className={clsx(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                              selectedChannel === ch.value
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                            )}
                          >
                            {ch.icon} {ch.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Generate Button */}
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={isGenerating}
                      onClick={() => handleGenerate(lead)}
                    >
                      <Sparkles className="h-4 w-4 mr-1.5" /> Generate Message
                    </Button>

                    {/* Generated Message Preview */}
                    {generatedMessage && (
                      <div className="space-y-3">
                        <div
                          className={clsx(
                            'rounded-xl p-4 whitespace-pre-wrap text-sm leading-relaxed',
                            selectedChannel === 'whatsapp'
                              ? 'bg-emerald-50 border border-emerald-200 text-slate-800 rounded-tl-none'
                              : selectedChannel === 'email'
                              ? 'bg-white border border-slate-200 text-slate-700 shadow-sm'
                              : 'bg-blue-50 border border-blue-200 text-slate-800'
                          )}
                        >
                          {selectedChannel === 'email' && (
                            <div className="mb-3 pb-3 border-b border-slate-100">
                              <p className="text-xs text-slate-400">
                                To: {lead.name} &lt;{lead.email || 'noemail@example.com'}&gt;
                              </p>
                              <p className="text-xs text-slate-400">
                                Subject: Follow-up on {lead.serviceInterested || 'your inquiry'}
                              </p>
                            </div>
                          )}
                          {generatedMessage}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(generatedMessage, lead.id)}
                          >
                            {copiedId === lead.id ? (
                              <><CheckCircle className="h-4 w-4 mr-1.5 text-emerald-500" /> Copied!</>
                            ) : (
                              <><Copy className="h-4 w-4 mr-1.5" /> Copy to Clipboard</>
                            )}
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleMarkFollowedUp(lead.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1.5" /> Mark as Followed Up
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Message Templates ────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-indigo-500" />
          Message Templates
        </h2>

        <Tabs tabs={TEMPLATE_TABS} activeTab={templateTab} onChange={setTemplateTab} />

        <div className="mt-4 space-y-3">
          {filteredTemplates.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-slate-400">No templates in this category yet.</p>
            </Card>
          ) : (
            filteredTemplates.map((tpl) => (
              <Card key={tpl.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h4 className="text-sm font-semibold text-slate-900">{tpl.name}</h4>
                      <Badge className="bg-slate-100 text-slate-600 text-xs capitalize">{tpl.channel}</Badge>
                      <Badge className="bg-indigo-50 text-indigo-600 text-xs capitalize">{tpl.tone}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">{tpl.body}</p>
                  </div>
                  <Button variant="outline" size="sm" className="flex-shrink-0">
                    <Send className="h-3.5 w-3.5 mr-1.5" /> Use
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
