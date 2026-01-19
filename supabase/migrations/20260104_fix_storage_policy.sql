-- Create the medicine-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('medicine-images', 'medicine-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Remove the explicit ALTER TABLE command which causes permission errors
-- (RLS is enabled by default on storage.objects anyway)

-- Policy: Allow Public Read (SELECT)
DROP POLICY IF EXISTS "Public Read medicine-images" ON storage.objects;
CREATE POLICY "Public Read medicine-images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'medicine-images' );

-- Policy: Allow Public Upload (INSERT)
DROP POLICY IF EXISTS "Public Upload medicine-images" ON storage.objects;
CREATE POLICY "Public Upload medicine-images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'medicine-images' );
