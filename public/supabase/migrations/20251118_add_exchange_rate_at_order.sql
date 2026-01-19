-- Add exchange_rate_at_order and total_dzd columns to save prices at the time of order creation
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS exchange_rate_at_order NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS total_dzd NUMERIC(10,2);

COMMENT ON COLUMN orders.exchange_rate_at_order IS 'Exchange rate USD to DZD at the time of order creation';
COMMENT ON COLUMN orders.total_dzd IS 'Total amount in DZD at the time of order creation';
