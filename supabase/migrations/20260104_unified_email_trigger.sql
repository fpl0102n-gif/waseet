-- Migration: Unified Medicine Request Email Trigger (Dynamic Type)

CREATE OR REPLACE FUNCTION public.handle_medicine_request_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_type TEXT;
  target_url TEXT;
  auth_header TEXT;
BEGIN
  -- Determine Email Type based on request_type
  IF NEW.request_type = 'local' THEN
    email_type := 'alkhayr_request_local';
  ELSE
    email_type := 'alkhayr_request_foreign';
  END IF;

  -- Get URL and Auth safely
  BEGIN
    target_url := 'https://' || current_setting('request.headers')::json->>'x-forwarded-host' || '/functions/v1/send-email';
    auth_header := current_setting('request.headers')::json->>'authorization';
  EXCEPTION WHEN OTHERS THEN
    target_url := 'http://host.docker.internal:54321/functions/v1/send-email'; -- Local fallback info (not actual)
    -- In production triggers, headers usually exist if coming from API. 
    -- If manual insert used, headers might be missing.
  END;

  PERFORM
    net.http_post(
      url := target_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', COALESCE(auth_header, 'Bearer SERVICE_KEY_PLACEHOLDER') -- Fallback if needed, but usually passed
      ),
      body := jsonb_build_object(
        'type', email_type,
        'record', row_to_json(NEW)
      )
    );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Email notification failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create Trigger on medicine_requests
DROP TRIGGER IF EXISTS on_medicine_request_insert ON public.medicine_requests;
CREATE TRIGGER on_medicine_request_insert
  AFTER INSERT ON public.medicine_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_medicine_request_email();
