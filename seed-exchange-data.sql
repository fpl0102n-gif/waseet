-- Quick setup script to insert test exchange rates and payment methods
-- Run this in Supabase SQL Editor if tables are empty

-- Insert exchange rates (buy/sell rates for common currency pairs)
INSERT INTO exchange_rates (currency_from, currency_to, buy_rate, sell_rate, is_active)
VALUES 
  ('USD', 'DZD', 132.50, 134.00, true),
  ('EUR', 'DZD', 145.00, 147.50, true),
  ('GBP', 'DZD', 168.00, 170.50, true),
  ('CAD', 'DZD', 95.00, 97.00, true),
  ('TRY', 'DZD', 4.20, 4.50, true)
ON CONFLICT (currency_from, currency_to) 
DO UPDATE SET 
  buy_rate = EXCLUDED.buy_rate,
  sell_rate = EXCLUDED.sell_rate,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Insert payment methods
INSERT INTO exchange_payment_methods (method_name, is_active, display_order)
VALUES
  ('Cash / Espèces', true, 1),
  ('CCP', true, 2),
  ('Baridi Mob', true, 3),
  ('Bank Transfer / Virement', true, 4),
  ('Western Union', true, 5),
  ('MoneyGram', true, 6),
  ('Wise', true, 7),
  ('PayPal', true, 8)
ON CONFLICT (method_name)
DO UPDATE SET
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;

-- Verify insertion
SELECT 'Exchange Rates:' as info, COUNT(*) as count FROM exchange_rates WHERE is_active = true
UNION ALL
SELECT 'Payment Methods:' as info, COUNT(*) as count FROM exchange_payment_methods WHERE is_active = true;
