-- Schema for Material Donations Module
-- UPDATED: Idempotent (Safe to re-run)

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE donation_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE item_category AS ENUM ('medicine', 'equipment', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE item_condition AS ENUM ('new', 'used_good', 'used_fair');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create the Donations Table
CREATE TABLE IF NOT EXISTS public.material_donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Donor Info (Private - Admin Only)
    donor_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    telegram TEXT,
    
    -- Item Info (Public when approved)
    item_name TEXT NOT NULL,
    category item_category NOT NULL,
    condition item_condition NOT NULL,
    quantity INTEGER DEFAULT 1,
    
    -- Location
    location TEXT NOT NULL, -- Wilaya or Country
    is_local BOOLEAN DEFAULT true, -- true = Local, false = Foreign
    
    -- Metadata
    description TEXT, -- Specific item description from donor
    admin_description TEXT, -- Public facing description written by admin
    main_image TEXT,
    images TEXT[], -- Array of image URLs
    status donation_status DEFAULT 'pending',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RLS Policies
ALTER TABLE public.material_donations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Public can insert donations" ON public.material_donations;
DROP POLICY IF EXISTS "Admins can view all donations" ON public.material_donations;
DROP POLICY IF EXISTS "Admins can update donations" ON public.material_donations;
DROP POLICY IF EXISTS "Admins can delete donations" ON public.material_donations;
DROP POLICY IF EXISTS "Public can view approved donations" ON public.material_donations;

-- Re-create Policies

-- Policy: Public (Anon) can insert
CREATE POLICY "Public can insert donations" ON public.material_donations
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Policy: Admins can view ALL
CREATE POLICY "Admins can view all donations" ON public.material_donations
    FOR SELECT
    TO authenticated
    USING ( public.check_is_super_admin() OR public.check_is_humanitarian_admin() );

-- Policy: Admins can update/delete
CREATE POLICY "Admins can update donations" ON public.material_donations
    FOR UPDATE
    TO authenticated
    USING ( public.check_is_super_admin() OR public.check_is_humanitarian_admin() );

CREATE POLICY "Admins can delete donations" ON public.material_donations
    FOR DELETE
    TO authenticated
    USING ( public.check_is_super_admin() OR public.check_is_humanitarian_admin() );

-- Policy: Public can view ONLY APPROVED items
CREATE POLICY "Public can view approved donations" ON public.material_donations
    FOR SELECT
    TO anon, authenticated
    USING ( status = 'approved' );


-- 4. Storage Bucket Setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('donation-images', 'donation-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Public can upload donation images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view donation images" ON storage.objects;

CREATE POLICY "Public can upload donation images" ON storage.objects
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'donation-images');

CREATE POLICY "Public can view donation images" ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'donation-images');

-- 5. Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';
