
-- Insert or Update Social Links for Popup
INSERT INTO public.settings (key, value)
VALUES 
  ('popup_facebook', 'https://www.facebook.com/profile.php?id=61585887913642'),
  ('popup_instagram', 'https://instagram.com/waseet.official'),
  ('popup_telegram', 'https://t.me/waseetstore'),
  ('popup_tiktok', 'https://www.tiktok.com/@waseet.official'),
  ('popup_whatsapp', 'https://wa.me/15873287505')
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value;
