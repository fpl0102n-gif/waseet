-- Add payment_notes column to withdrawal_requests table
ALTER TABLE public.withdrawal_requests 
ADD COLUMN IF NOT EXISTS payment_notes text;

-- Notify pgrst to reload schema cache
NOTIFY pgrst, 'reload schema';
