-- Add exchange rate setting for USD to DZD conversion
INSERT INTO public.settings (key, value) VALUES
  ('exchange_rate_usd_to_dzd', '135.50')
ON CONFLICT (key) DO NOTHING;
