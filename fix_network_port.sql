-- FIX NETWORK PORT (DOCKER HOST ISSUE)
-- The DB is in Docker, but your terminal is on Windows.
-- "localhost" in DB = the container itself (Empty).
-- We need "host.docker.internal" to reach your Windows terminal on port 9999.

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
  -- 1. Get Headers nicely
  BEGIN
    rec_headers := current_setting('request.headers', true)::json;
  EXCEPTION WHEN OTHERS THEN
    rec_headers := '{}'::json;
  END;
  
  base_url := rec_headers->>'x-forwarded-host';
  
  -- 2. Construct URL (Target HOST machine from Docker)
  IF base_url IS NULL OR base_url = '' OR base_url LIKE '%localhost%' OR base_url LIKE '%127.0.0.1%' THEN
     -- USE PORT 9999 and host.docker.internal
     final_url := 'http://host.docker.internal:9999/functions/v1/send-email';
  ELSE
     final_url := 'https://' || base_url || '/functions/v1/send-email';
  END IF;

  -- 3. Log
  INSERT INTO public.debug_email_logs (message, details)
  VALUES ('Trigger V6 (Port 9999)', jsonb_build_object('type', TG_ARGV[0], 'url', final_url, 'id', NEW.id));

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
