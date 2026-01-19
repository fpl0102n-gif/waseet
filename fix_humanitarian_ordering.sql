-- Add display_order and urgency columns to alkhayr_requests (Humanitarian)
ALTER TABLE public.alkhayr_requests 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'normal';

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
