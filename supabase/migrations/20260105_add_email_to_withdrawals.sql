
-- Add email column to withdrawal_requests for optional notifications
ALTER TABLE public.withdrawal_requests 
ADD COLUMN IF NOT EXISTS email text;
