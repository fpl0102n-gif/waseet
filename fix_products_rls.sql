-- Fix RLS for Products Table
-- Ensures Admins can Insert/Update/Delete
-- Ensures Public can View

-- 1. Enable RLS (Ensure it is on)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

-- 3. Public Read Access
CREATE POLICY "Public can view products"
ON public.products
FOR SELECT
USING (true);

-- 4. Admin Write Access
CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles 
    WHERE role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles 
    WHERE role IN ('admin', 'super_admin')
  )
);
