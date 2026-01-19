-- Force Re-creation of Order Update Email Trigger

-- 1. Drop existing trigger and function to ensure clean slate
DROP TRIGGER IF EXISTS on_order_updated_email ON public.orders;
DROP FUNCTION IF EXISTS public.handle_order_update_email();

-- 2. Re-create the Function
CREATE OR REPLACE FUNCTION public.handle_order_update_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log to Postgres logs for debugging
  RAISE LOG 'Order Updated: Old Status %, New Status %', OLD.status, NEW.status;

  PERFORM
    net.http_post(
      url := 'https://' || current_setting('request.headers')::json->>'x-forwarded-host' || '/functions/v1/send-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', current_setting('request.headers')::json->>'authorization'
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
    RAISE WARNING 'Email notification failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. Re-create the Trigger
CREATE TRIGGER on_order_updated_email
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  -- Trigger if Status changes OR Notes change
  WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.notes IS DISTINCT FROM NEW.notes)
  EXECUTE FUNCTION public.handle_order_update_email();

-- 4. Verification Message
SELECT 'Trigger successfully created' as result;
