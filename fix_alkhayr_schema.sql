-- Create tables for Al-Khayr Initiative

-- 1. Local Humanitarian Medicines
CREATE TABLE IF NOT EXISTS public.humanitarian_medicines (
    id SERIAL PRIMARY KEY,
    requester_name TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    medicine_name TEXT NOT NULL,
    description TEXT,
    city TEXT NOT NULL,
    wilaya TEXT NOT NULL, -- Specific to local
    type TEXT DEFAULT 'request', -- 'request' or 'donation'
    status TEXT DEFAULT 'pending', -- pending, approved, fulfilled, cancelled
    urgency_level TEXT DEFAULT 'normal', -- normal, high
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) -- Optional, if logged in
);

-- 2. Foreign Medical Requests
CREATE TABLE IF NOT EXISTS public.foreign_medical_requests (
    id SERIAL PRIMARY KEY,
    requester_name TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    medicine_name TEXT NOT NULL,
    description TEXT,
    city TEXT NOT NULL,
    country TEXT NOT NULL, -- Specific to foreign
    status TEXT DEFAULT 'pending',
    urgency_level TEXT DEFAULT 'normal',
    image_url TEXT,
    prescription_url TEXT, -- Specific to foreign
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id)
);

-- 3. Enable RLS
ALTER TABLE public.humanitarian_medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foreign_medical_requests ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (Public Submission, Open Read)
-- Local Medicines
DROP POLICY IF EXISTS "Public view medicines" ON public.humanitarian_medicines;
CREATE POLICY "Public view medicines" ON public.humanitarian_medicines FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert medicines" ON public.humanitarian_medicines;
CREATE POLICY "Public insert medicines" ON public.humanitarian_medicines FOR INSERT WITH CHECK (true);

-- Foreign Requests
DROP POLICY IF EXISTS "Public view foreign requests" ON public.foreign_medical_requests;
CREATE POLICY "Public view foreign requests" ON public.foreign_medical_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert foreign requests" ON public.foreign_medical_requests;
CREATE POLICY "Public insert foreign requests" ON public.foreign_medical_requests FOR INSERT WITH CHECK (true);


-- 5. Storage Bucket Configuration (medicine-images)
-- Check if bucket exists, if not insert (this is a data insert into storage.buckets)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medicine-images', 'medicine-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS
DROP POLICY IF EXISTS "Public Access Medicine Images" ON storage.objects;
CREATE POLICY "Public Access Medicine Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'medicine-images' );

DROP POLICY IF EXISTS "Public Upload Medicine Images" ON storage.objects;
CREATE POLICY "Public Upload Medicine Images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'medicine-images' );

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
