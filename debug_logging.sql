-- Create a debug log table
CREATE TABLE IF NOT EXISTS public.debug_email_logs (
    id SERIAL PRIMARY KEY,
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message TEXT,
    details JSONB
);

-- Update the function to log to this table
CREATE OR REPLACE FUNCTION public.handle_order_update_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    request_url TEXT;
    request_headers JSONB;
BEGIN
    -- 1. Log entry into function
    INSERT INTO public.debug_email_logs (message, details)
    VALUES ('Trigger Fired', jsonb_build_object('order_id', NEW.id, 'old_status', OLD.status, 'new_status', NEW.status));

    -- 2. Construct URL and Headers
    request_url := 'https://' || current_setting('request.headers')::json->>'x-forwarded-host' || '/functions/v1/send-email';
    request_headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', current_setting('request.headers')::json->>'authorization'
    );

    -- Log URL and Headers (masked auth)
    INSERT INTO public.debug_email_logs (message, details)
    VALUES ('Preparing Request', jsonb_build_object('url', request_url, 'headers_present', request_headers IS NOT NULL));

    -- 3. Perform Request
    PERFORM
        net.http_post(
            url := request_url,
            headers := request_headers,
            body := jsonb_build_object(
                'type', 'order_update',
                'record', row_to_json(NEW),
                'old_record', row_to_json(OLD)
            )
        );

    -- 4. Log Success
    INSERT INTO public.debug_email_logs (message, details)
    VALUES ('Request Sent', jsonb_build_object('timestamp', NOW()));

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log Error
        INSERT INTO public.debug_email_logs (message, details)
        VALUES ('Error in Trigger', jsonb_build_object('error', SQLERRM, 'state', SQLSTATE));
        RETURN NEW;
END;
$$;

-- Verification
SELECT 'Debug logging enabled' as status;
