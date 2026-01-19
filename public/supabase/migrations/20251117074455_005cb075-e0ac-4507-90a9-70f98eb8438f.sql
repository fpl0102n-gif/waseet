-- Drop and recreate the insert policy for orders to ensure it works
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;

-- Create a proper public insert policy
CREATE POLICY "Public can insert orders"
  ON public.orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Add DZD exchange rate setting
INSERT INTO public.settings (key, value) 
VALUES ('usd_to_dzd_rate', '135.00')
ON CONFLICT (key) DO NOTHING;