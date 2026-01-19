-- 1. Ensure the trigger function exists (idempotent)
CREATE OR REPLACE FUNCTION public.handle_new_email()
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
        'record', row_to_json(NEW)
      )
    );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Email notification failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 2. Create the Trigger for Material Donations
DROP TRIGGER IF EXISTS on_material_donation_update_email ON public.material_donations;

CREATE TRIGGER on_material_donation_update_email
  AFTER UPDATE ON public.material_donations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'approved')
  EXECUTE FUNCTION public.handle_new_email('material_donation_approved');
