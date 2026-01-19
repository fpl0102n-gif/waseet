-- Alternative: Use Supabase Webhooks instead of triggers
-- This is more reliable than pg_net

-- Step 1: Enable pg_net extension (run this first)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Step 2: Recreate the notification function with proper error handling
CREATE OR REPLACE FUNCTION notify_alkhayr_telegram()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  payload JSONB;
  request_id BIGINT;
BEGIN
  -- Get the Edge Function URL from settings
  SELECT value INTO function_url 
  FROM public.alkhayr_settings 
  WHERE key = 'telegram_notification_url';
  
  IF function_url IS NULL THEN
    RAISE NOTICE 'Telegram function URL not configured in alkhayr_settings';
    RETURN NEW;
  END IF;

  -- Build payload based on table
  IF TG_TABLE_NAME = 'local_medicine_requests' THEN
    payload := jsonb_build_object(
      'type', 'local_request',
      'record', to_jsonb(NEW)
    );
  ELSIF TG_TABLE_NAME = 'foreign_medicine_requests' THEN
    payload := jsonb_build_object(
      'type', 'foreign_request',
      'record', to_jsonb(NEW)
    );
  ELSIF TG_TABLE_NAME = 'diaspora_volunteers' THEN
    payload := jsonb_build_object(
      'type', 'volunteer',
      'record', to_jsonb(NEW)
    );
  ELSE
    RETURN NEW;
  END IF;

  -- Call Edge Function using pg_net
  SELECT extensions.http_post(
    url := function_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := payload
  ) INTO request_id;
  
  RAISE NOTICE 'Telegram notification sent. Request ID: %', request_id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error sending telegram notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Drop existing triggers
DROP TRIGGER IF EXISTS trigger_notify_local_request ON public.local_medicine_requests;
DROP TRIGGER IF EXISTS trigger_notify_foreign_request ON public.foreign_medicine_requests;
DROP TRIGGER IF EXISTS trigger_notify_volunteer ON public.diaspora_volunteers;

-- Step 4: Recreate triggers
CREATE TRIGGER trigger_notify_local_request
  AFTER INSERT ON public.local_medicine_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_alkhayr_telegram();

CREATE TRIGGER trigger_notify_foreign_request
  AFTER INSERT ON public.foreign_medicine_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_alkhayr_telegram();

CREATE TRIGGER trigger_notify_volunteer
  AFTER INSERT ON public.diaspora_volunteers
  FOR EACH ROW
  EXECUTE FUNCTION notify_alkhayr_telegram();

-- Step 5: Verify the setup
SELECT 'Triggers created successfully!' as status;

-- To test manually:
-- SELECT extensions.http_post(
--   url := 'https://ocwlkljrjhgqejetgfgw.supabase.co/functions/v1/alkhayr-telegram-notifications',
--   headers := '{"Content-Type": "application/json"}'::jsonb,
--   body := '{"type": "test", "record": {"message": "Test notification"}}'::jsonb
-- );
