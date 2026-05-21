-- 1. Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    lead_id UUID NULL REFERENCES public.leads(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    lead_name TEXT NOT NULL,
    lead_phone TEXT NOT NULL,
    service TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'unpaid', -- paid, unpaid, overdue
    due_date TEXT NOT NULL,                -- Format: "YYYY-MM-DD"
    paid_at TIMESTAMP WITH TIME ZONE NULL,
    payment_method TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create indices for fast querying and sorting
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS invoices_lead_id_idx ON public.invoices(lead_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON public.invoices(status);
CREATE INDEX IF NOT EXISTS invoices_created_at_idx ON public.invoices(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- SELECT policy: Users can only read their own invoices
CREATE POLICY "Users can read their own invoices" 
ON public.invoices FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- INSERT policy: Users can only create their own invoices
CREATE POLICY "Users can create their own invoices" 
ON public.invoices FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE policy: Users can only update their own invoices
CREATE POLICY "Users can update their own invoices" 
ON public.invoices FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- DELETE policy: Users can only delete their own invoices
CREATE POLICY "Users can delete their own invoices" 
ON public.invoices FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 5. Role Permissions
GRANT ALL ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
