
-- Add email column to local_medicine_requests
ALTER TABLE IF EXISTS public.local_medicine_requests
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add email column to foreign_medicine_requests
ALTER TABLE IF EXISTS public.foreign_medicine_requests
ADD COLUMN IF NOT EXISTS email TEXT;

-- Comment for clarity
COMMENT ON COLUMN public.local_medicine_requests.email IS 'Optional email for notifications';
COMMENT ON COLUMN public.foreign_medicine_requests.email IS 'Optional email for notifications';
