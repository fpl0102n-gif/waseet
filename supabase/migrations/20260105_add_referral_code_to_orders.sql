
-- Add referral_code column to orders table if it doesn't exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS referral_code text;

-- Create an index for faster lookups since we filter by this column
CREATE INDEX IF NOT EXISTS idx_orders_referral_code ON public.orders(referral_code);
