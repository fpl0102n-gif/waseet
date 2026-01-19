-- Allow anonymous users to view orders by ID for order tracking
-- This policy enables public order tracking without authentication

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;

-- Create new policies for viewing orders
-- Policy 1: Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Policy 2: Anyone (anon or authenticated) can view orders
-- This allows order tracking page to work for all users
CREATE POLICY "Anyone can view orders"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy 3: Anyone can insert orders (public form submission)
CREATE POLICY "Anyone can insert orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
