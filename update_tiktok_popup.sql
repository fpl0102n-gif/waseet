-- Update the TikTok link for the Social Popup
INSERT INTO settings (key, value, description)
VALUES (
  'popup_tiktok', 
  'https://tiktok.com/@waseetofficial',
  'Link for TikTok in the social popup'
)
ON CONFLICT (key) DO UPDATE
SET value = 'https://tiktok.com/@waseetofficial';
