-- FINAL PRODUCTION TRIGGER V3 (Hardcoded URL + Robust Logic)

-- 1. Ensure Log Table
CREATE TABLE IF NOT EXISTS public.debug_email_logs (
    id SERIAL PRIMARY KEY,
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message TEXT,
    details JSONB
);

-- 2. Clean Up
DROP TRIGGER IF EXISTS on_order_updated_email ON public.orders;
DROP FUNCTION IF EXISTS public.handle_order_update_email();

-- 3. The Function
CREATE OR REPLACE FUNCTION public.handle_order_update_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    headers_text TEXT;
    headers_json JSONB;
    auth_header TEXT;
    final_url TEXT;
BEGIN
    -- HARDCODED URL FROM USER
    final_url := 'https://ocwlkljrjhgqejetgfgw.supabase.co/functions/v1/send-email';

    -- Attempt to get headers (for Auth)
    headers_text := current_setting('request.headers', true);
    
    IF headers_text IS NOT NULL THEN
        headers_json := headers_text::jsonb;
        auth_header := headers_json->>'authorization';
    ELSE
        -- Fallback: If no headers (e.g. internal admin script), we can't easily sign the request.
        -- We will log this warning.
        INSERT INTO public.debug_email_logs (message, details)
        VALUES ('Warning: Missing Headers', jsonb_build_object('order_id', NEW.id, 'source', 'Internal/SQL Editor'));
        
        -- If we don't have an auth header, the Edge Function might reject us (401).
        -- But we proceed anyway to try.
    END IF;

    -- LOGGING INTENT
    INSERT INTO public.debug_email_logs (message, details)
    VALUES ('Trigger Initiated', jsonb_build_object(
        'order_id', NEW.id, 
        'status_change', OLD.status || ' -> ' || NEW.status,
        'has_auth', auth_header IS NOT NULL
    ));

    -- PERFORM REQUEST
    PERFORM
        net.http_post(
            url := final_url,
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', auth_header -- might be null
            ),
            body := jsonb_build_object(
                'type', 'order_update',
                'record', row_to_json(NEW),
                'old_record', row_to_json(OLD)
            )
        );

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        INSERT INTO public.debug_email_logs (message, details)
        VALUES ('Trigger Crashed', jsonb_build_object('error', SQLERRM));
        RETURN NEW;
END;
$$;

-- 4. Trigger Definition
-- We re-enable the condition to avoid spam, but keep it broad.
CREATE TRIGGER on_order_updated_email
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  WHEN (
      (OLD.status IS DISTINCT FROM NEW.status) OR 
      (OLD.notes::text IS DISTINCT FROM NEW.notes::text)
  )
  EXECUTE FUNCTION public.handle_order_update_email();

SELECT 'Final V3 Trigger Installed (Hardcoded URL: https://ocwlkljrjhgqejetgfgw.supabase.co)' as status;
