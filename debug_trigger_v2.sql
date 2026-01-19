-- DEBUG TRIGGER V2 (Safe Headers + Unconditional Fire)

-- 1. Ensure Log Table
CREATE TABLE IF NOT EXISTS public.debug_email_logs (
    id SERIAL PRIMARY KEY,
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message TEXT,
    details JSONB
);

-- 2. Drop Old Stuff
DROP TRIGGER IF EXISTS on_order_updated_email ON public.orders;
DROP FUNCTION IF EXISTS public.handle_order_update_email();

-- 3. Robust Function (Logs Everywhere + Safe Headers)
CREATE OR REPLACE FUNCTION public.handle_order_update_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    headers_text TEXT;
    headers_json JSONB;
    base_url TEXT;
    final_url TEXT;
BEGIN
    -- LOG START
    INSERT INTO public.debug_email_logs (message, details)
    VALUES ('Trigger V2 FIRED', jsonb_build_object('order_id', NEW.id, 'old_status', OLD.status, 'new_status', NEW.status));

    -- SAFE HEADER EXTRACTION
    headers_text := current_setting('request.headers', true);
    IF headers_text IS NULL THEN
        -- Fallback if triggered by internal system process without headers
        INSERT INTO public.debug_email_logs (message, details)
        VALUES ('Warning: No Headers (Internal Update?)', jsonb_build_object('id', NEW.id));
        -- preventing crash, but can't send email mostly
        RETURN NEW; 
    ELSE
        headers_json := headers_text::jsonb;
    END IF;

    -- GET URL
    base_url := headers_json->>'x-forwarded-host';
    IF base_url IS NULL THEN
         INSERT INTO public.debug_email_logs (message, details)
         VALUES ('Skipping (No Host)', jsonb_build_object('headers', headers_json));
         RETURN NEW;
    END IF;

    final_url := 'https://' || base_url || '/functions/v1/send-email';

    -- SEND
    PERFORM
        net.http_post(
            url := final_url,
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', headers_json->>'authorization'
            ),
            body := jsonb_build_object(
                'type', 'order_update',
                'record', row_to_json(NEW),
                'old_record', row_to_json(OLD)
            )
        );

    INSERT INTO public.debug_email_logs (message, details)
    VALUES ('Request V2 Sent', jsonb_build_object('url', final_url));

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        INSERT INTO public.debug_email_logs (message, details)
        VALUES ('V2 CRITICAL ERROR', jsonb_build_object('error', SQLERRM));
        RETURN NEW;
END;
$$;

-- 4. UNCONDITIONAL Trigger (No WHEN clause)
-- If this works, the previous WHEN clause was the problem.
CREATE TRIGGER on_order_updated_email
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_update_email();

SELECT 'Debug Trigger V2 Installed (Unconditional)' as status;
