-- Add Display Columns for Strict Curation
ALTER TABLE public.transport_volunteers
ADD COLUMN IF NOT EXISTS display_initials TEXT,
ADD COLUMN IF NOT EXISTS display_location TEXT,
ADD COLUMN IF NOT EXISTS display_description TEXT;

-- Update RLS Policies to ensure public can ONLY read active volunteers
--Ideally, we'd have a separate view, but for now we enforce via Frontend + Policies
DROP POLICY IF EXISTS "Public Read Transport" ON public.transport_volunteers;

CREATE POLICY "Public Read Transport" 
ON public.transport_volunteers
FOR SELECT 
TO anon, authenticated
USING (status = 'active');

-- Create a function to auto-update display_initials (optional convenience) or leave for Admin UI
-- We will handle the logic in the Admin UI for flexibility (e.g. "A. B." or "Ahmed B.")
