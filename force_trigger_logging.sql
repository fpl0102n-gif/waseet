-- Enable Logging inside the Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. LOG TRIGGER EXECUTION (Proof that DB Trigger fired)
  INSERT INTO public.debug_email_logs (message, details)
  VALUES (
    'DB Trigger Fired For: ' || TG_ARGV[0], 
    jsonb_build_object('record_id', NEW.id, 'endpoint', 'https://' || current_setting('request.headers')::json->>'x-forwarded-host' || '/functions/v1/send-email')
  );

  -- 2. Send the Request
  PERFORM
    net.http_post(
      url := 'https://' || current_setting('request.headers')::json->>'x-forwarded-host' || '/functions/v1/send-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', current_setting('request.headers')::json->>'authorization'
      ),
      body := jsonb_build_object(
        'type', TG_ARGV[0],
        'record', row_to_json(NEW)
      )
    );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO public.debug_email_logs (message, details)
    VALUES ('Trigger Failed', jsonb_build_object('error', SQLERRM));
    RETURN NEW;
END;
$$;
