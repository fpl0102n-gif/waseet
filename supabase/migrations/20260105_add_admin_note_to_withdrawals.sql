
-- Add admin_note column to withdrawal_requests for transaction IDs or rejection reasons
ALTER TABLE public.withdrawal_requests 
ADD COLUMN IF NOT EXISTS admin_note text;
