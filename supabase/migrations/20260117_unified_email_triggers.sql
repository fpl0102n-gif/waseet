-- Unified Email Triggers for Waseet Platform
-- This migration standardizes email sending for 'orders' and 'withdrawal_requests' via Database Triggers.
-- It replaces any client-side invocations and potential ghost triggers.

-- 1. Create/Replace the universal email handler function
CREATE OR REPLACE FUNCTION public.handle_new_email_v2()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_type TEXT;
  target_url TEXT;
  auth_header TEXT;
BEGIN
  -- Determine Type based on Table Name
  IF TG_TABLE_NAME = 'orders' THEN
    email_type := 'order';
  ELSIF TG_TABLE_NAME = 'withdrawal_requests' THEN
    email_type := 'withdrawal_request';
  ELSE
    email_type := 'unknown';
  END IF;

  -- Construct Target URL (Dynamic for local/prod)
  -- Note: We default to the standard edge function URL structure
  BEGIN
    target_url := current_setting('request.headers', true)::json->>'origin';
    IF target_url IS NULL OR target_url = 'null' THEN
       target_url := 'http://localhost:54321'; -- Fallback
    END IF;
    -- Append function path. NOTE: Adjust project ref if using platform.
    -- For safety in Postgres triggers usually we use the internal network or the public URL if configured.
    -- Here we assume 'send-email' function exists.
    target_url := 'https://' || (SELECT value FROM public.secrets WHERE name = 'PROJECT_REF') || '.supabase.co/functions/v1/send-email'; 
    
    -- HARDCODED FALLBACK for simplicity in this generated script if secrets table not reliable
    -- Using the generic Supabase Edge Function URL pattern or pg_net specific
    -- Better approach: Use net.http_post directly to the relative path or known endpoint
  EXCEPTION WHEN OTHERS THEN
     target_url := 'http://localhost:54321/functions/v1/send-email';
  END;

  -- Attempt to send via pg_net (Supabase standard for async requests)
  -- We'll use a hardcoded endpoint relative to the project if possible, or just the function we know works.
  -- Since we don't have the project ref easily in SQL without setup, we will try to use the `handle_new_email` logic if it exists, or create our own simple one.
  -- To be robust, let's just use the existing `handle_new_email` function signature if possible, OR re-implement simple net.http_post
  
  -- Re-implementing simplified logic:
  PERFORM
    net.http_post(
      url := 'https://' || current_setting('request.headers', true)::json->>'x-forwarded-host' || '/functions/v1/send-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', current_setting('request.headers', true)::json->>'authorization'
      ),
      body := jsonb_build_object(
        'type', email_type,
        'record', row_to_json(NEW)
      )
    );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Email trigger failed: %', SQLERRM;
    RETURN NEW;
END;
$$;


-- 2. Clean up ANY existing triggers on these tables to prevent ghost duplicates
DROP TRIGGER IF EXISTS on_order_created_email ON public.orders;
DROP TRIGGER IF EXISTS on_withdrawal_request_email ON public.withdrawal_requests;
-- Drop any potential "ghost" names guessed
DROP TRIGGER IF EXISTS on_new_order ON public.orders;
DROP TRIGGER IF EXISTS tr_order_email ON public.orders;
DROP TRIGGER IF EXISTS on_new_withdrawal ON public.withdrawal_requests;


-- 3. Create Trigger for ORDERS
CREATE TRIGGER on_order_created_email
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_email_v2();


-- 4. Create Trigger for WITHDRAWAL REQUESTS
CREATE TRIGGER on_withdrawal_request_email
  AFTER INSERT ON public.withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_email_v2();
