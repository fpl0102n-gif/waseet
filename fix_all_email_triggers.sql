-- COMPREHENSIVE FIX FOR EMAIL TRIGGERS
-- Run this ENTIRE script in the Supabase SQL Editor.

-- 1. Enable the required extension for HTTP calls
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

-- 2. Create/Replace the function to call Edge Function
CREATE OR REPLACE FUNCTION public.handle_new_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions -- Ensure access to pg_net
AS $$
DECLARE
  headers jsonb;
  payload jsonb;
  request_url text;
BEGIN
  -- Construct URL (Dynamic based on project)
  -- If x-forwarded-host is missing, we default to localhost for safety, but in prod it should be there.
  -- You might need to HARDCODE your Supabase Project URL if this fails.
  -- format: https://<project-ref>.supabase.co/functions/v1/send-email
  
  -- Attempting generic dynamic URL construction:
  request_url := 'https://' || coalesce(
      current_setting('request.headers', true)::json->>'x-forwarded-host', 
      'YOUR_PROJECT_ID.supabase.co' -- FALLBACK: REPLACE THIS IF NEEDED
  ) || '/functions/v1/send-email';

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

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error to Postgres logs so we can see it
    RAISE WARNING 'Email Trigger Failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. Re-create the Trigger for Material Donations
DROP TRIGGER IF EXISTS on_material_donation_update_email ON public.material_donations;

CREATE TRIGGER on_material_donation_update_email
  AFTER UPDATE ON public.material_donations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'approved')
  EXECUTE FUNCTION public.handle_new_email('material_donation_approved');

-- 4. Verification Log
INSERT INTO public.debug_email_logs (message, details) 
VALUES ('SQL Fix Applied', '{"status": "Triggers Recreated"}');
