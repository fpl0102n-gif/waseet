-- Create storage bucket for store product images
-- Run this in Supabase SQL Editor

-- Create the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-products', 'store-products', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to product images
CREATE POLICY "Public read access for store products"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'store-products');

-- Allow authenticated users (admins) to upload images
CREATE POLICY "Authenticated upload for store products"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'store-products');

-- Allow authenticated users (admins) to update images
CREATE POLICY "Authenticated update for store products"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'store-products')
WITH CHECK (bucket_id = 'store-products');

-- Allow authenticated users (admins) to delete images
CREATE POLICY "Authenticated delete for store products"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'store-products');

