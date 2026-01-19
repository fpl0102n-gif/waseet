-- Add Telegram notifications for Al-Khayr system
-- Triggers will call Edge Function when new requests/volunteers are created

-- Function to notify via Edge Function
CREATE OR REPLACE FUNCTION notify_alkhayr_telegram()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  payload JSON;
BEGIN
  -- Get the Edge Function URL from environment or settings
  function_url := current_setting('app.alkhayr_telegram_function_url', true);
  
  IF function_url IS NULL THEN
    RAISE NOTICE 'Telegram function URL not configured';
    RETURN NEW;
  END IF;

  -- Build payload based on table
  IF TG_TABLE_NAME = 'local_medicine_requests' THEN
    payload := json_build_object(
      'type', 'local_request',
      'record', row_to_json(NEW)
    );
  ELSIF TG_TABLE_NAME = 'foreign_medicine_requests' THEN
    payload := json_build_object(
      'type', 'foreign_request',
      'record', row_to_json(NEW)
    );
  ELSIF TG_TABLE_NAME = 'diaspora_volunteers' THEN
    payload := json_build_object(
      'type', 'volunteer',
      'record', row_to_json(NEW)
    );
  END IF;

  -- Call Edge Function using pg_net extension
  -- Note: pg_net must be enabled in Supabase Dashboard -> Database -> Extensions
  BEGIN
    PERFORM net.http_post(
      url := function_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := payload::jsonb
    );
  EXCEPTION WHEN undefined_function THEN
    -- pg_net not available, log the payload for debugging
    RAISE NOTICE 'pg_net extension not enabled. Payload: %', payload;
  END;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error sending telegram notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for local medicine requests
CREATE TRIGGER trigger_notify_local_request
  AFTER INSERT ON public.local_medicine_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_alkhayr_telegram();

-- Trigger for foreign medicine requests
CREATE TRIGGER trigger_notify_foreign_request
  AFTER INSERT ON public.foreign_medicine_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_alkhayr_telegram();

-- Trigger for volunteer registrations
CREATE TRIGGER trigger_notify_volunteer
  AFTER INSERT ON public.diaspora_volunteers
  FOR EACH ROW
  EXECUTE FUNCTION notify_alkhayr_telegram();

-- Add admin_notes column if not exists (for notes feature)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'local_medicine_requests' 
                 AND column_name = 'admin_notes') THEN
    ALTER TABLE public.local_medicine_requests
    ADD COLUMN admin_notes TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'foreign_medicine_requests' 
                 AND column_name = 'admin_notes') THEN
    ALTER TABLE public.foreign_medicine_requests
    ADD COLUMN admin_notes TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'diaspora_volunteers' 
                 AND column_name = 'admin_notes') THEN
    ALTER TABLE public.diaspora_volunteers
    ADD COLUMN admin_notes TEXT;
  END IF;
END $$;

-- Create settings table for configuration
CREATE TABLE IF NOT EXISTS public.alkhayr_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default Edge Function URL (you'll need to update this after deployment)
INSERT INTO public.alkhayr_settings (key, value, description)
VALUES (
  'telegram_notification_url',
  'YOUR_SUPABASE_URL/functions/v1/alkhayr-telegram-notifications',
  'Edge Function URL for Telegram notifications'
)
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE public.alkhayr_settings IS 'Configuration settings for Al-Khayr system';
