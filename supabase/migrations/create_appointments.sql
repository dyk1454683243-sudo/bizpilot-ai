-- 1. Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    lead_id UUID NULL REFERENCES public.leads(id) ON DELETE SET NULL,
    lead_name TEXT NOT NULL,
    lead_phone TEXT NOT NULL,
    lead_email TEXT NULL,
    service TEXT NOT NULL,
    date TEXT NOT NULL,           -- Format: "YYYY-MM-DD"
    time TEXT NOT NULL,           -- Format: "HH:MM"
    duration INTEGER NOT NULL DEFAULT 30, -- Duration in minutes
    status TEXT NOT NULL DEFAULT 'confirmed', -- confirmed, pending, cancelled, completed
    notes TEXT NULL,
    reminder_sent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create indices for fast querying and sorting
CREATE INDEX IF NOT EXISTS appointments_user_id_idx ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS appointments_lead_id_idx ON public.appointments(lead_id);
CREATE INDEX IF NOT EXISTS appointments_date_time_idx ON public.appointments(date, time);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- SELECT policy: Users can only read their own appointments
CREATE POLICY "Users can read their own appointments" 
ON public.appointments FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- INSERT policy: Users can only create their own appointments
CREATE POLICY "Users can create their own appointments" 
ON public.appointments FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE policy: Users can only update their own appointments
CREATE POLICY "Users can update their own appointments" 
ON public.appointments FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- DELETE policy: Users can only delete their own appointments
CREATE POLICY "Users can delete their own appointments" 
ON public.appointments FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 5. Role Permissions
GRANT ALL ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
