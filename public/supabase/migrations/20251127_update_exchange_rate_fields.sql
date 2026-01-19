-- Migration to update exchange_requests table
-- Adds admin_rate, min_quantity fields and updates structure

-- Add new columns to exchange_requests
ALTER TABLE exchange_requests 
ADD COLUMN IF NOT EXISTS admin_rate DECIMAL(15, 4),
ADD COLUMN IF NOT EXISTS min_quantity DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS price_min DECIMAL(15, 4),
ADD COLUMN IF NOT EXISTS price_max DECIMAL(15, 4);

-- Update exchange_settings with new defaults
INSERT INTO exchange_settings (key, value) VALUES
  ('min_price_tolerance', '0.05'),
  ('max_price_tolerance', '0.20'),
  ('default_min_quantity', '100')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Add comment for documentation
COMMENT ON COLUMN exchange_requests.admin_rate IS 'Exchange rate set by admin for this request';
COMMENT ON COLUMN exchange_requests.min_quantity IS 'Minimum quantity/amount required for this request';
COMMENT ON COLUMN exchange_requests.price_min IS 'Minimum acceptable price (set by admin or system)';
COMMENT ON COLUMN exchange_requests.price_max IS 'Maximum acceptable price (set by admin or system)';
