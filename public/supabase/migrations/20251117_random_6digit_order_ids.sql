-- Add random 6-digit order IDs
-- This migration replaces the default BIGSERIAL id with a random 6-digit number (100000-999999)

-- Drop existing id column and recreate with new logic
ALTER TABLE orders ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS orders_id_seq CASCADE;

-- Create function to generate unique random 6-digit order IDs
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS BIGINT AS $$
DECLARE
  new_id BIGINT;
  done BOOLEAN := FALSE;
BEGIN
  WHILE NOT done LOOP
    -- Generate random number between 100000 and 999999
    new_id := floor(random() * 900000 + 100000)::BIGINT;
    
    -- Check if this ID already exists
    IF NOT EXISTS (SELECT 1 FROM orders WHERE id = new_id) THEN
      done := TRUE;
    END IF;
  END LOOP;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Set the new function as default for id column
ALTER TABLE orders ALTER COLUMN id SET DEFAULT generate_order_id();

-- Update existing orders to have 6-digit IDs (if any exist)
DO $$
DECLARE
  order_record RECORD;
  new_random_id BIGINT;
BEGIN
  FOR order_record IN SELECT id FROM orders ORDER BY id LOOP
    new_random_id := generate_order_id();
    UPDATE orders SET id = new_random_id WHERE id = order_record.id;
  END LOOP;
END $$;
