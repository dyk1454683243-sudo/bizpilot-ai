import { supabase } from './supabase';
import { type Review, type ReviewStatus } from './types';

// Helper to map DB row to Review interface
export function mapDbReview(row: any): Review {
  return {
    id: row.id,
    leadId: row.lead_id || '',
    leadName: row.lead_name,
    service: row.service,
    rating: Number(row.rating),
    comment: row.comment || '',
    status: row.status as ReviewStatus,
    requestedAt: row.requested_at,
    completedAt: row.completed_at || undefined,
  };
}

// Helper to map Review fields to DB structure
export function mapReviewToDb(review: Partial<Review>) {
  const dbRow: any = {};
  if (review.leadId !== undefined) dbRow.lead_id = review.leadId || null;
  if (review.leadName !== undefined) dbRow.lead_name = review.leadName;
  if (review.service !== undefined) dbRow.service = review.service;
  if (review.rating !== undefined) dbRow.rating = review.rating;
  if (review.comment !== undefined) dbRow.comment = review.comment;
  if (review.status !== undefined) dbRow.status = review.status;
  if (review.requestedAt !== undefined) dbRow.requested_at = review.requestedAt;
  if (review.completedAt !== undefined) dbRow.completed_at = review.completedAt || null;
  return dbRow;
}

// Fetch all reviews for the logged-in user
export async function fetchReviews(): Promise<Review[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map(mapDbReview);
}

// Create a new review request for the current logged-in user
export async function createReview(review: Omit<Review, 'id'>): Promise<Review> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  const dbRow = {
    ...mapReviewToDb(review),
    user_id: session.user.id,
  };

  const { data, error } = await supabase
    .from('reviews')
    .insert([dbRow])
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    throw error;
  }

  return mapDbReview(data);
}

// Update an existing review
export async function updateReview(id: string, updates: Partial<Review>): Promise<Review> {
  const dbRow = {
    ...mapReviewToDb(updates),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('reviews')
    .update(dbRow)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating review ${id}:`, error);
    throw error;
  }

  return mapDbReview(data);
}

// Delete a review
export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting review ${id}:`, error);
    throw error;
  }
}
