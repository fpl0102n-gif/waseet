
-- Fix Email Triggers: Enable pg_net and use Hardcoded Connection Details
-- This fixes issues where 'x-forwarded-host' or 'authorization' headers are missing (e.g. Dashboard inserts)

-- 1. Ensure pg_net extension is enabled
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA extensions;

-- 2. Redefine the Function with Hardcoded URL and Key
CREATE OR REPLACE FUNCTION public.handle_new_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_url TEXT := 'https://ocwlkljrjhgqejetgfgw.supabase.co/functions/v1/send-email';
  anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jd2xrbGpyamhncWVqZXRnZmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjYwNTEsImV4cCI6MjA3ODk0MjA1MX0.hMW0hB8RUEXCEoCS88H2YvOlDBeyz9oEhEPJeF38jRE';
  request_id BIGINT;
BEGIN
  -- We use net.http_post directly with specific credentials
  SELECT net.http_post(
      url := project_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || anon_key
      ),
      body := jsonb_build_object(
        'type', TG_ARGV[0],
        'record', row_to_json(NEW)
      )
  ) INTO request_id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Email notification failed: %', SQLERRM;
    RETURN NEW;
END;
$$;
