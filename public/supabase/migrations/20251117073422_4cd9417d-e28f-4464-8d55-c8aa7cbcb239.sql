-- Create settings table for admin configuration
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view and update settings
CREATE POLICY "Admins can view settings"
  ON public.settings
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update settings"
  ON public.settings
  FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert settings"
  ON public.settings
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES
  ('contact_whatsapp', '+1234567890'),
  ('contact_telegram', '@yourusername'),
  ('contact_email', 'support@waseet.com')
ON CONFLICT (key) DO NOTHING;