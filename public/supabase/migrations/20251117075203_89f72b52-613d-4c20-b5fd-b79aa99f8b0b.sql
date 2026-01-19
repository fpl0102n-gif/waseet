-- Fix the insert policy for anonymous users
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;

-- Create proper policy allowing both anonymous and authenticated users
CREATE POLICY "Allow all to insert orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (true);