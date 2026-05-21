-- 1. Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    business_id UUID NULL,
    name TEXT NOT NULL,
    email TEXT NULL,
    phone TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'manual',
    status TEXT NOT NULL DEFAULT 'new',
    score INTEGER NOT NULL DEFAULT 50,
    notes TEXT NOT NULL DEFAULT '',
    service_interested TEXT NULL,
    assigned_to UUID NULL,
    last_contacted_at TIMESTAMP WITH TIME ZONE NULL,
    next_follow_up_at TIMESTAMP WITH TIME ZONE NULL,
    activities JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS leads_user_id_idx ON public.leads(user_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- SELECT policy: Users can read their own leads
CREATE POLICY "Users can read their own leads" 
ON public.leads FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- INSERT policy: Users can create their own leads
CREATE POLICY "Users can create their own leads" 
ON public.leads FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE policy: Users can update their own leads
CREATE POLICY "Users can update their own leads" 
ON public.leads FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- DELETE policy: Users can delete their own leads
CREATE POLICY "Users can delete their own leads" 
ON public.leads FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 5. Grant explicit table permissions to authenticated, anon, and service_role
GRANT ALL ON public.leads TO authenticated;
GRANT ALL ON public.leads TO anon;
GRANT ALL ON public.leads TO service_role;
