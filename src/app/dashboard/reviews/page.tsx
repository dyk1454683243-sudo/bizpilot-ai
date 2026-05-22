'use client';

import { useState, useMemo, useEffect } from 'react';
import clsx from 'clsx';
import { type Review, type Lead } from '@/lib/types';
import { fetchReviews, createReview, updateReview, deleteReview } from '@/lib/reviews-db';
import { fetchLeads } from '@/lib/leads-db';
import { generateReviewRequest } from '@/lib/mock-ai';
import { formatDate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import { StatCard } from '@/components/ui/Card';
import { useToast } from '@/contexts/ToastContext';
import {
  Star,
  MessageSquare,
  Send,
  Clock,
  CheckCircle2,
  Quote,
  Sparkles,
  User,
  Loader2,
  Trash2,
  CheckSquare,
  AlertCircle,
  Pencil,
} from 'lucide-react';

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={clsx(
            sizeClass,
            i <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
          )}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // States for Completing/Editing a Review
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [completeRating, setCompleteRating] = useState(5);
  const [completeComment, setCompleteComment] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);
      const [reviewsData, leadsData] = await Promise.all([
        fetchReviews(),
        fetchLeads(),
      ]);
      setReviews(reviewsData);
      setLeads(leadsData);
    } catch (err: any) {
      console.error('Error loading reviews or leads:', err);
      setError(err.message || 'Failed to load reviews data.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Stats
  const totalReviews = reviews.length;
  const completedReviews = useMemo(() => reviews.filter((r) => r.status === 'completed'), [reviews]);
  const avgRating = useMemo(() => {
    if (completedReviews.length === 0) return 0;
    const sum = completedReviews.reduce((s, r) => s + r.rating, 0);
    return Number((sum / completedReviews.length).toFixed(1));
  }, [completedReviews]);
  const pendingRequests = useMemo(
    () => reviews.filter((r) => r.status === 'requested').length,
    [reviews]
  );

  // Leads who are paid (eligible for review requests)
  const paidLeads = useMemo(
    () =>
      leads
        .filter((l) => l.status === 'paid')
        .filter((l) => !reviews.some((r) => r.leadId === l.id)),
    [leads, reviews]
  );

  async function handleGenerateMessage() {
    const lead = leads.find((l) => l.id === selectedLeadId);
    if (!lead) return;

    setIsGenerating(true);
    setIsSent(false);
    try {
      const msg = await generateReviewRequest(lead.name, lead.serviceInterested || 'our service');
      setGeneratedMessage(msg);
      showToast('AI crafted review request message successfully!', 'success');
    } catch (err: any) {
      console.error('Error generating review request message:', err);
      showToast('Failed to generate review request message.', 'error');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSendRequest() {
    const lead = leads.find((l) => l.id === selectedLeadId);
    if (!lead) return;

    try {
      const newReview: Omit<Review, 'id'> = {
        leadId: lead.id,
        leadName: lead.name,
        service: lead.serviceInterested || '',
        rating: 0,
        comment: '',
        status: 'requested',
        requestedAt: new Date().toISOString(),
      };

      const created = await createReview(newReview);
      setReviews((prev) => [created, ...prev]);
      setIsSent(true);
      showToast(`Review request sent to ${lead.name}!`, 'success');

      setTimeout(() => {
        setIsRequestModalOpen(false);
        setSelectedLeadId('');
        setGeneratedMessage('');
        setIsSent(false);
      }, 1500);
    } catch (err: any) {
      console.error('Error sending review request:', err);
      showToast('Failed to send review request.', 'error');
    }
  }

  function openCompleteModal(review: Review) {
    setSelectedReview(review);
    setCompleteRating(review.rating || 5);
    setCompleteComment(review.comment || '');
    setIsCompleteModalOpen(true);
  }

  async function handleCompleteReview() {
    if (!selectedReview) return;
    if (!completeComment.trim()) {
      showToast('Please enter a testimonial comment.', 'warning');
      return;
    }

    try {
      setIsCompleting(true);
      const updates: Partial<Review> = {
        rating: completeRating,
        comment: completeComment,
        status: 'completed',
        completedAt: new Date().toISOString(),
      };

      const updated = await updateReview(selectedReview.id, updates);
      setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      showToast(`Successfully updated review from ${selectedReview.leadName}!`, 'success');
      setIsCompleteModalOpen(false);
      setSelectedReview(null);
    } catch (err: any) {
      console.error('Error updating review:', err);
      showToast('Failed to update review.', 'error');
    } finally {
      setIsCompleting(false);
    }
  }

  async function handleDeleteReview(id: string) {
    if (!confirm('Are you sure you want to delete this review request?')) return;

    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      showToast('Review request deleted successfully.', 'success');
    } catch (err: any) {
      console.error('Error deleting review:', err);
      showToast('Failed to delete review request.', 'error');
    }
  }

  function closeRequestModal() {
    setIsRequestModalOpen(false);
    setSelectedLeadId('');
    setGeneratedMessage('');
    setIsSent(false);
  }

  function closeCompleteModal() {
    setIsCompleteModalOpen(false);
    setSelectedReview(null);
    setCompleteComment('');
    setCompleteRating(5);
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 bg-slate-200 rounded w-48" />
            <div className="h-4 bg-slate-200 rounded w-64" />
          </div>
          <div className="h-10 bg-slate-200 rounded w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-24 bg-slate-200 rounded-xl" />
          <div className="h-24 bg-slate-200 rounded-xl" />
          <div className="h-24 bg-slate-200 rounded-xl" />
        </div>
        <div className="space-y-4">
          <div className="h-6 bg-slate-200 rounded w-36" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-44 bg-slate-200 rounded-xl" />
            <div className="h-44 bg-slate-200 rounded-xl" />
            <div className="h-44 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-6 text-center">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-rose-900">Error loading reviews</h3>
        <p className="text-xs text-rose-600 mt-1">{error}</p>
        <Button variant="outline" onClick={loadData} className="mt-4 border-rose-200 text-rose-700 hover:bg-rose-100/50">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
            Reviews & Testimonials
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Collect feedback and build social proof</p>
        </div>
        <Button variant="primary" onClick={() => setIsRequestModalOpen(true)}>
          <Send className="h-4 w-4 mr-1.5" />
          Request Review
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<MessageSquare className="h-5 w-5 text-indigo-600" />}
          label="Total Reviews"
          value={totalReviews}
          className="border border-indigo-100 bg-indigo-50/30"
        />
        <StatCard
          icon={<Star className="h-5 w-5 text-amber-500 fill-amber-500" />}
          label="Average Rating"
          value={
            <span className="flex items-center gap-2">
              {avgRating}
              <StarRating rating={Math.round(avgRating)} size="sm" />
            </span>
          }
          className="border border-amber-100 bg-amber-50/30"
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-blue-600" />}
          label="Pending Requests"
          value={pendingRequests}
          className="border border-blue-100 bg-blue-50/30"
        />
      </div>

      {/* Testimonials Grid */}
      {completedReviews.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            Testimonials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Decorative gradient */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Quote mark */}
                  <div className="flex justify-between items-start mb-3">
                    <Quote className="h-8 w-8 text-indigo-100" />
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openCompleteModal(review)}
                        className="text-slate-400 hover:text-indigo-600 p-1"
                        title="Edit testimonial"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete testimonial"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-sm text-slate-600 leading-relaxed italic">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>

                <div>
                  {/* Rating */}
                  <div className="mt-4">
                    <StarRating rating={review.rating} />
                  </div>

                  {/* Author */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {review.leadName.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{review.leadName}</p>
                      <p className="text-xs text-slate-500 truncate">{review.service}</p>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 mt-2">
                    {review.completedAt && formatDate(review.completedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Requests List */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">All Review Requests</h2>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {/* Desktop header */}
          <div className="hidden sm:grid grid-cols-7 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Lead Name</span>
            <span>Service</span>
            <span>Status</span>
            <span>Requested</span>
            <span>Completed</span>
            <span>Rating</span>
            <span>Actions</span>
          </div>

          {reviews.length === 0 ? (
            <div className="p-12 text-center">
              <Star className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No reviews yet</p>
              <p className="text-sm text-slate-400 mt-1">Request your first review from a client</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="grid grid-cols-1 sm:grid-cols-7 gap-2 sm:gap-4 px-5 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors items-center"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400 shrink-0 sm:hidden" />
                  <span className="text-sm font-medium text-slate-900">{review.leadName}</span>
                </div>
                <span className="text-sm text-slate-600">{review.service}</span>
                <div>
                  <Badge
                    className={
                      review.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }
                  >
                    <span className="flex items-center gap-1">
                      {review.status === 'completed' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </span>
                  </Badge>
                </div>
                <span className="text-sm text-slate-500">{formatDate(review.requestedAt)}</span>
                <span className="text-sm text-slate-500">
                  {review.completedAt ? formatDate(review.completedAt) : '—'}
                </span>
                <div>
                  {review.status === 'completed' ? (
                    <StarRating rating={review.rating} size="sm" />
                  ) : (
                    <span className="text-xs text-slate-400">Awaiting response</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {review.status === 'requested' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openCompleteModal(review)}
                      className="text-xs px-2 py-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50 flex items-center gap-1"
                    >
                      <CheckSquare className="h-3.5 w-3.5" />
                      Complete
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openCompleteModal(review)}
                      className="text-xs px-2 py-1 text-slate-500 hover:text-indigo-600"
                      title="Edit Review"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteReview(review.id)}
                    className="text-xs px-2 py-1 text-slate-400 hover:text-rose-600"
                    title="Delete Request"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Request Review Modal */}
      <Modal isOpen={isRequestModalOpen} onClose={closeRequestModal} title="Request a Review">
        <div className="space-y-5">
          {isSent ? (
            <div className="text-center py-8">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Review Request Sent!</h3>
              <p className="text-sm text-slate-500 mt-1">The client will receive your request shortly.</p>
            </div>
          ) : (
            <>
              <Select
                label="Select Client"
                options={[
                  { value: '', label: 'Choose a client...' },
                  ...paidLeads.map((l) => ({ value: l.id, label: `${l.name} — ${l.serviceInterested || 'N/A'}` })),
                ]}
                value={selectedLeadId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setSelectedLeadId(e.target.value);
                  setGeneratedMessage('');
                }}
              />

              {selectedLeadId && !generatedMessage && (
                <Button
                  variant="outline"
                  onClick={handleGenerateMessage}
                  isLoading={isGenerating}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Generate Review Request Message
                </Button>
              )}

              {isGenerating && (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-indigo-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  AI is crafting your message...
                </div>
              )}

              {generatedMessage && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Message Preview</label>
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4">
                      <p className="text-sm text-slate-700 whitespace-pre-line">{generatedMessage}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={closeRequestModal}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSendRequest}>
                      <Send className="h-4 w-4 mr-1.5" />
                      Send Request
                    </Button>
                  </div>
                </div>
              )}

              {!selectedLeadId && paidLeads.length === 0 && (
                <div className="text-center py-4 text-sm text-slate-500">
                  No clients with &quot;Paid&quot; status are available for review requests.
                </div>
              )}
            </>
          )}
        </div>
      </Modal>

      {/* Complete/Edit Review Modal */}
      <Modal
        isOpen={isCompleteModalOpen}
        onClose={closeCompleteModal}
        title={selectedReview?.status === 'completed' ? 'Edit Testimonial' : 'Complete Review Feedback'}
      >
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Client:</span>
            <span className="text-sm font-semibold text-slate-900">{selectedReview?.leadName}</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block">Rating</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setCompleteRating(i)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={clsx(
                      "h-7 w-7",
                      i <= completeRating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 block">Testimonial Comment</label>
            <textarea
              className="w-full min-h-[120px] rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter client's review comment or feedback..."
              value={completeComment}
              onChange={(e) => setCompleteComment(e.target.value)}
            />
          </div>

          <div className="flex justify-end items-center gap-3">
            <Button variant="ghost" onClick={closeCompleteModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCompleteReview}
              isLoading={isCompleting}
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Save Review
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
