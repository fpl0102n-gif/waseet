
-- Add email column to material_donations
ALTER TABLE IF EXISTS public.material_donations
ADD COLUMN IF NOT EXISTS donor_email TEXT;

COMMENT ON COLUMN public.material_donations.donor_email IS 'Optional email for donor notifications';
