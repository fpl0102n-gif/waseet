
-- Run this in your Supabase SQL Editor
-- It adds the missing email column to the diaspora_volunteers table

ALTER TABLE IF EXISTS public.diaspora_volunteers
ADD COLUMN IF NOT EXISTS email TEXT;

COMMENT ON COLUMN public.diaspora_volunteers.email IS 'Optional email for volunteer notifications';
