-- FINAL PRODUCTION TRIGGER
-- dynamic URL handling that works for both Local (Docker Internal) and Cloud.

CREATE OR REPLACE FUNCTION public.handle_new_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_url text;
  final_url text;
  rec_headers json;
BEGIN
  -- 1. Get Headers
  BEGIN
    rec_headers := current_setting('request.headers', true)::json;
  EXCEPTION WHEN OTHERS THEN
    rec_headers := '{}'::json;
  END;
  
  base_url := rec_headers->>'x-forwarded-host';
  
  -- 2. Construct URL
  -- Check if we are running locally (localhost)
  IF base_url IS NULL OR base_url = '' OR base_url LIKE '%localhost%' OR base_url LIKE '%127.0.0.1%' THEN
     -- Route to the internal Docker API Gateway (Kong) on 54321
     final_url := 'http://localhost:54321/functions/v1/send-email';
  ELSE
     -- In Production, use HTTPS and the real domain
     final_url := 'https://' || base_url || '/functions/v1/send-email';
  END IF;

  -- 3. Log for debugging (Optional, can be removed later)
  INSERT INTO public.debug_email_logs (message, details)
  VALUES ('Trigger V7 (Prod)', jsonb_build_object('type', TG_ARGV[0], 'url', final_url, 'id', NEW.id));

  -- 4. Send
  PERFORM net.http_post(
    url := final_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', rec_headers->>'authorization'),
    body := jsonb_build_object('type', TG_ARGV[0], 'record', row_to_json(NEW))
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.debug_email_logs (message, details) VALUES ('Trigger Failed', jsonb_build_object('err', SQLERRM));
  RETURN NEW;
END;
$$;
