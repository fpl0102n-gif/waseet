-- Schema for Store Product Suggestions feature

-- 1. Create Enum for Status
DO $$ BEGIN
    CREATE TYPE suggestion_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create the Suggestions Table
CREATE TABLE IF NOT EXISTS public.store_product_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Personal Info
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    telegram TEXT,
    -- Product Info
    product_name TEXT NOT NULL,
    proposed_price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'DZD',
    product_description TEXT,
    -- Source Info
    store_name TEXT,
    store_location TEXT, -- Extra field mentioned in prompt
    source_type TEXT CHECK (source_type IN ('local', 'imported')),
    -- Metadata
    images TEXT[], -- Array of image URLs
    status suggestion_status DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RLS Policies
ALTER TABLE public.store_product_suggestions ENABLE ROW LEVEL SECURITY;

-- Policy: Public (Anon) can insert
CREATE POLICY "Public can insert suggestions" ON public.store_product_suggestions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Policy: Only Admins can view/update
-- defined using our helper function
CREATE POLICY "Super Admins can view suggestions" ON public.store_product_suggestions
    FOR SELECT
    TO authenticated
    USING ( public.check_is_super_admin() );

CREATE POLICY "Super Admins can update suggestions" ON public.store_product_suggestions
    FOR UPDATE
    TO authenticated
    USING ( public.check_is_super_admin() );

CREATE POLICY "Super Admins can delete suggestions" ON public.store_product_suggestions
    FOR DELETE
    TO authenticated
    USING ( public.check_is_super_admin() );

-- 4. Storage Bucket Setup (Attempt to Insert if system permissions allow)
INSERT INTO storage.buckets (id, name, public)
VALUES ('suggestion-images', 'suggestion-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public can upload suggestion images" ON storage.objects
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'suggestion-images');

CREATE POLICY "Public can view suggestion images" ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'suggestion-images');
