-- FINAL FIX: Hardcode the Project URL
-- The automatic detection failed because the database doesn't know its own URL.
-- YOU MUST REPLACE THE TEXT BELOW WITH YOUR PROJECT ID.

CREATE OR REPLACE FUNCTION public.handle_new_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  headers jsonb;
  payload jsonb;
  request_url text;
  -- 👇👇👇 REPLACE THIS VALUE 👇👇👇
  -- Example: 'abcdefghijklm' (Found in your Supabase Dashboard URL)
  project_ref text := 'ocwlkljrjhgqejetgfgw'; 
  -- 👆👆👆 REPLACE THIS VALUE 👆👆👆
BEGIN



  -- DEBUG: Log entry
  INSERT INTO public.debug_trigger_logs (step, details) VALUES ('Start', 'Type: ' || TG_ARGV[0]);

  -- Construct Hardcoded URL
  request_url := 'https://' || project_ref || '.supabase.co/functions/v1/send-email';

  headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', current_setting('request.headers', true)::json->>'authorization'
  );

  payload := jsonb_build_object(
      'type', TG_ARGV[0],
      'record', row_to_json(NEW)
  );

  -- Perform the HTTP POST
  PERFORM
    net.http_post(
      url := request_url,
      headers := headers,
      body := payload
    );

  -- Log Success
  INSERT INTO public.debug_trigger_logs (step, details)
  VALUES ('Final Fix Sent', 'URL: ' || request_url);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO public.debug_trigger_logs (step, details)
    VALUES ('EXCEPTION', SQLERRM);
    RETURN NEW;
END;
$$;

-- Ensure Trigger is Active
DROP TRIGGER IF EXISTS on_material_donation_update_email ON public.material_donations;

CREATE TRIGGER on_material_donation_update_email
  AFTER UPDATE ON public.material_donations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'approved')
  EXECUTE FUNCTION public.handle_new_email('material_donation_approved');
