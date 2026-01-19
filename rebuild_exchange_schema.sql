-- Rebuild Exchange Schema

-- 1. Add new columns to exchange_requests
ALTER TABLE exchange_requests 
ADD COLUMN IF NOT EXISTS timeframe text,
ADD COLUMN IF NOT EXISTS wilaya text,
ADD COLUMN IF NOT EXISTS preferred_payment_method text; -- Renaming or clarifying 'payment_method'

-- 2. Update exchange_rates or create a config table for allowed payment methods per currency
-- We'll add a 'allowed_payment_methods' array to the existing exchange_rates table 
-- to control which methods are available for that specific currency pair/direction.
ALTER TABLE exchange_rates 
ADD COLUMN IF NOT EXISTS allowed_payment_methods text[] DEFAULT '{}';

-- 3. Create a type for timeframe if we want strict validation (optional, using text for flexibility now)
-- CREATE TYPE timeframe_type AS ENUM ('asap', 'same_day', '24h', '48h', 'custom');

-- 4. Comments for documentation
COMMENT ON COLUMN exchange_requests.timeframe IS 'ASAP, Same day, Within 24h, Within 48h, Custom';
COMMENT ON COLUMN exchange_requests.wilaya IS 'User location wilaya';
COMMENT ON COLUMN exchange_rates.allowed_payment_methods IS 'Array of allowed payment methods for this currency pair, e.g. ["Hand-to-hand", "Bank Transfer"]';
