-- V4 DEBUG TRIGGER (Unconditional + RLS Check)

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

-- 3. Function (Hardcoded URL + unconditional logging)
CREATE OR REPLACE FUNCTION public.handle_order_update_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    final_url TEXT := 'https://ocwlkljrjhgqejetgfgw.supabase.co/functions/v1/send-email';
    auth_header TEXT;
    headers_text TEXT;
BEGIN
    headers_text := current_setting('request.headers', true);
    IF headers_text IS NOT NULL THEN
        auth_header := (headers_text::jsonb)->>'authorization';
    END IF;

    -- LOGGING EVERY TOUCH
    INSERT INTO public.debug_email_logs (message, details)
    VALUES ('V4 Trigger: Row Touched', jsonb_build_object(
        'order_id', NEW.id, 
        'old_status', OLD.status,
        'new_status', NEW.status,
        'changed', (OLD.status IS DISTINCT FROM NEW.status) OR (OLD.notes::text IS DISTINCT FROM NEW.notes::text)
    ));

    -- SEND REQUEST
    PERFORM
        net.http_post(
            url := final_url,
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', auth_header
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
        VALUES ('V4 Error', jsonb_build_object('error', SQLERRM));
        RETURN NEW;
END;
$$;

-- 4. Unconditional Trigger (FIRE ON EVERYTHING)
CREATE TRIGGER on_order_updated_email
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_update_email();

-- 5. DIAGNOSIS: Show RLS Policies
SELECT * FROM pg_policies WHERE tablename = 'orders';
