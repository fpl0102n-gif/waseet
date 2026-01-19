-- COMPLETE EMAIL FIX 2026-01-03
-- 1. Defines the 'handle_new_email' function with DEBUG LOGGING.
-- 2. Sets up triggers for Material Donations and Product Suggestions.

-- STEP 1: Define the Function
CREATE OR REPLACE FUNCTION public.handle_new_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  headers jsonb;
  payload jsonb;
  request_url text;
  -- 👇👇👇 HARDCODED PROJECT REF 👇👇👇
  project_ref text := 'ocwlkljrjhgqejetgfgw'; 
  -- 👆👆👆 
BEGIN

  -- DEBUG: Log entry to prove function started
  INSERT INTO public.debug_trigger_logs (step, details) 
  VALUES ('Start', 'Type: ' || TG_ARGV[0] || ', Record ID: ' || NEW.id);

  -- Construct URL
  request_url := 'https://' || project_ref || '.supabase.co/functions/v1/send-email';

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

  -- Log Success
  INSERT INTO public.debug_trigger_logs (step, details)
  VALUES ('Sent', 'URL: ' || request_url);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO public.debug_trigger_logs (step, details)
    VALUES ('EXCEPTION', SQLERRM);
    RETURN NEW;
END;
$$;

-- STEP 2: Triggers for Material Donations

-- 2.1: Approved
DROP TRIGGER IF EXISTS on_material_donation_update_email ON public.material_donations;
CREATE TRIGGER on_material_donation_update_email
  AFTER UPDATE ON public.material_donations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'approved')
  EXECUTE FUNCTION public.handle_new_email('material_donation_approved');

-- 2.2: Rejected
DROP TRIGGER IF EXISTS on_material_donation_rejected_email ON public.material_donations;
CREATE TRIGGER on_material_donation_rejected_email
  AFTER UPDATE ON public.material_donations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'rejected')
  EXECUTE FUNCTION public.handle_new_email('material_donation_rejected');


-- STEP 3: Triggers for Product Suggestions

-- 3.1: New Suggestion (Insert)
DROP TRIGGER IF EXISTS on_product_suggestion_created ON public.store_product_suggestions;
CREATE TRIGGER on_product_suggestion_created
  AFTER INSERT ON public.store_product_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_email('product_suggestion');

-- 3.2: Suggestion Update (Status Change)
DROP TRIGGER IF EXISTS on_product_suggestion_update ON public.store_product_suggestions;
CREATE TRIGGER on_product_suggestion_update
  AFTER UPDATE ON public.store_product_suggestions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.handle_new_email('product_suggestion_update');
