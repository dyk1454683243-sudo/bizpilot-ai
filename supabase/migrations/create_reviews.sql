-- 1. Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    lead_id UUID NULL REFERENCES public.leads(id) ON DELETE SET NULL,
    lead_name TEXT NOT NULL,
    service TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    comment TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'requested', -- 'requested' or 'completed'
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create indices for fast querying and sorting
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS reviews_lead_id_idx ON public.reviews(lead_id);
CREATE INDEX IF NOT EXISTS reviews_status_idx ON public.reviews(status);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON public.reviews(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- SELECT policy: Users can only read their own reviews
CREATE POLICY "Users can read their own reviews" 
ON public.reviews FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- INSERT policy: Users can only create their own reviews
CREATE POLICY "Users can create their own reviews" 
ON public.reviews FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE policy: Users can only update their own reviews
CREATE POLICY "Users can update their own reviews" 
ON public.reviews FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- DELETE policy: Users can only delete their own reviews
CREATE POLICY "Users can delete their own reviews" 
ON public.reviews FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 5. Role Permissions
GRANT ALL ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
