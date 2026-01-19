-- Fix column name mismatch for Product Suggestions
-- Frontend expects 'description', but table was created with 'product_description'

-- 1. Rename column
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'store_product_suggestions' 
    AND column_name = 'product_description'
  ) THEN
    ALTER TABLE public.store_product_suggestions 
    RENAME COLUMN product_description TO description;
  END IF;
END $$;

-- 2. Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';
