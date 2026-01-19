-- Migration: Normalize Store & Orders
-- Objective: Add SKU to products and Status History to Orders.

BEGIN;

-- 1. Update Products Table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sku text,
ADD COLUMN IF NOT EXISTS track_quantity boolean DEFAULT true;

-- Ensure SKU is unique if provided
-- We use a conditional index or constraint. For now, unique constraint is fine 
-- but might fail if existing duplicates exist.
-- Safe approach: Add unique index.
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_idx ON public.products (sku) WHERE sku IS NOT NULL;


-- 2. Update Orders Table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS status_history jsonb DEFAULT '[]'::jsonb;

-- 3. Isolate Store Suggestions (ensure RLS)
-- Checking if table exists (it does from previous findings).
-- Ensure RLS is on.
ALTER TABLE public.store_product_suggestions ENABLE ROW LEVEL SECURITY;

-- Policy: Admin read
-- CREATE POLICY "Admins can view suggestions" ...

-- Policy: Public insert
DROP POLICY IF EXISTS "Public can suggest products" ON public.store_product_suggestions;
CREATE POLICY "Public can suggest products" ON public.store_product_suggestions
    FOR INSERT WITH CHECK (true);

COMMIT;
