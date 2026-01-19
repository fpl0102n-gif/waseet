-- DEBUGGING SCRIPT: Material Donation Trigger
-- Run this in Supabase SQL Editor to pinpoint why the email isn't sending.

-- 1. Create a log table to see if the trigger even fires
CREATE TABLE IF NOT EXISTS public.debug_trigger_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    step TEXT,
    details TEXT
);

-- 2. Update the function to log every step
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
  project_host text;
BEGIN
  -- LOG STEP 1: Function Started
  INSERT INTO public.debug_trigger_logs (step, details)
  VALUES ('Function Started', 'Type: ' || TG_ARGV[0] || ', ID: ' || NEW.id);

  -- Determine Host
  project_host := current_setting('request.headers', true)::json->>'x-forwarded-host';
  
  -- LOG STEP 2: Host Resolution
  INSERT INTO public.debug_trigger_logs (step, details)
  VALUES ('Host Resolution', 'Resolved Host: ' || COALESCE(project_host, 'NULL (Will fail)'));

  -- Stop if no host (Prevent silent failure)
  IF project_host IS NULL THEN
     RAISE WARNING 'Cannot determine Supabase Host from headers';
     INSERT INTO public.debug_trigger_logs (step, details) VALUES ('Error', 'Host is NULL - Aborting');
     -- Fallback to a placeholder just to try?
     -- request_url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-email';
  ELSE
     request_url := 'https://' || project_host || '/functions/v1/send-email';
  END IF;

  headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', current_setting('request.headers', true)::json->>'authorization'
  );

  payload := jsonb_build_object(
      'type', TG_ARGV[0],
      'record', row_to_json(NEW)
  );
  
  -- LOG STEP 3: Preparing to Send
  INSERT INTO public.debug_trigger_logs (step, details)
  VALUES ('Sending Request', 'URL: ' || COALESCE(request_url, 'NULL'));

  IF request_url IS NOT NULL THEN
      PERFORM
        net.http_post(
          url := request_url,
          headers := headers,
          body := payload
        );
      
      -- LOG STEP 4: Sent
      INSERT INTO public.debug_trigger_logs (step, details)
      VALUES ('Request Sent', 'Payload size: ' || length(payload::text));
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO public.debug_trigger_logs (step, details)
    VALUES ('EXCEPTION', SQLERRM);
    RETURN NEW;
END;
$$;

-- 3. Confirm Trigger exists
DROP TRIGGER IF EXISTS on_material_donation_update_email ON public.material_donations;

CREATE TRIGGER on_material_donation_update_email
  AFTER UPDATE ON public.material_donations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'approved')
  EXECUTE FUNCTION public.handle_new_email('material_donation_approved');

-- 4. Clean previous logs
DELETE FROM public.debug_trigger_logs;
