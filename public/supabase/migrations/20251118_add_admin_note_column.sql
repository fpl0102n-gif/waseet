-- Add admin_note column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS admin_note TEXT;

-- Add comment
COMMENT ON COLUMN orders.admin_note IS 'Internal admin notes for the order';
