-- Create function to handle order updates with OLD/NEW comparison
CREATE OR REPLACE FUNCTION public.handle_order_update_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://' || current_setting('request.headers')::json->>'x-forwarded-host' || '/functions/v1/send-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', current_setting('request.headers')::json->>'authorization'
      ),
      body := jsonb_build_object(
        'type', TG_ARGV[0],
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

-- Create Trigger for Order Updates
DROP TRIGGER IF EXISTS on_order_updated_email ON public.orders;
CREATE TRIGGER on_order_updated_email
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  -- Trigger only if Status changes OR Notes change (we will filter public note changes in Edge Function)
  WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.notes IS DISTINCT FROM NEW.notes)
  EXECUTE FUNCTION public.handle_order_update_email('order_update');
