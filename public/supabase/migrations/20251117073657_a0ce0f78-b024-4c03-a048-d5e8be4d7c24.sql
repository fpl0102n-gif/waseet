-- Allow anyone to view contact settings (for public contact page)
CREATE POLICY "Anyone can view settings"
  ON public.settings
  FOR SELECT
  USING (true);