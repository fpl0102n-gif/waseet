
-- Add email column to diaspora_volunteers
ALTER TABLE IF EXISTS public.diaspora_volunteers
ADD COLUMN IF NOT EXISTS email TEXT;

COMMENT ON COLUMN public.diaspora_volunteers.email IS 'Optional email for volunteer notifications';
