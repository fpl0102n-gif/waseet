-- Add admin_note column to withdrawal_requests table
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS admin_note TEXT;
