-- Add missing columns to agents table to match registration data
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS telegram TEXT,
ADD COLUMN IF NOT EXISTS shipping_countries TEXT[],
ADD COLUMN IF NOT EXISTS shipment_frequency TEXT,
ADD COLUMN IF NOT EXISTS price_per_kg NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS currency TEXT,
ADD COLUMN IF NOT EXISTS pricing_type TEXT,
ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
