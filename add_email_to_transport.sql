-- Add email column to transport_volunteers
ALTER TABLE public.transport_volunteers 
ADD COLUMN IF NOT EXISTS email TEXT;
