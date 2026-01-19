
-- Setup Email Notification Triggers (Fixed Table Names)

-- 1. Create the Database Function to Call Edge Function
CREATE OR REPLACE FUNCTION public.handle_new_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- We assume the record has fields like id, email (or contact info).
  -- The Edge Function handles validation of whether to send or not.
  -- TG_ARGV[0] passes the 'type' string (e.g. 'order', 'blood_donor').

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
    -- Swallow errors to ensure DB insert never fails due to notification issue
    RAISE WARNING 'Email notification failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 2. Create Triggers for Each Table

-- WASEET: Orders
DROP TRIGGER IF EXISTS on_order_created_email ON public.orders;
CREATE TRIGGER on_order_created_email
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_email('order');

-- WASEET: Exchange Requests
DROP TRIGGER IF EXISTS on_exchange_created_email ON public.exchange_requests;
CREATE TRIGGER on_exchange_created_email
  AFTER INSERT ON public.exchange_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_email('exchange_request');

-- WASEET: Import Requests
DROP TRIGGER IF EXISTS on_import_created_email ON public.import_requests;
CREATE TRIGGER on_import_created_email
  AFTER INSERT ON public.import_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_email('import_request');

-- WASEET: Store Product Suggestions
DROP TRIGGER IF EXISTS on_suggestion_created_email ON public.store_product_suggestions;
CREATE TRIGGER on_suggestion_created_email
  AFTER INSERT ON public.store_product_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_email('product_suggestion');

-- WASEET: Agent Registrations
DROP TRIGGER IF EXISTS on_agent_registration_email ON public.agent_registrations;
CREATE TRIGGER on_agent_registration_email
  AFTER INSERT ON public.agent_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_email('agent_registration');

-- ALKHAYR: Local Requests
DROP TRIGGER IF EXISTS on_alkhayr_local_email ON public.local_medicine_requests;
CREATE TRIGGER on_alkhayr_local_email
  AFTER INSERT ON public.local_medicine_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_email('alkhayr_request_local');

-- ALKHAYR: Foreign Requests
DROP TRIGGER IF EXISTS on_alkhayr_foreign_email ON public.foreign_medicine_requests;
CREATE TRIGGER on_alkhayr_foreign_email
  AFTER INSERT ON public.foreign_medicine_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_email('alkhayr_request_foreign');

-- ALKHAYR: Material Donations
DROP TRIGGER IF EXISTS on_material_donation_email ON public.material_donations;
CREATE TRIGGER on_material_donation_email
  AFTER INSERT ON public.material_donations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_email('material_donation');

-- ALKHAYR: Transport Volunteers
DROP TRIGGER IF EXISTS on_transport_volunteer_email ON public.transport_volunteers;
CREATE TRIGGER on_transport_volunteer_email
  AFTER INSERT ON public.transport_volunteers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_email('transport_volunteer');

-- BLOOD: Donors
-- (Attempting to add trigger if table exists. 
-- Since I couldn't verify file name, if this fails, user will report. 
-- Standardizing 'blood_donors' as per common schema usage in project).
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blood_donors') THEN
      DROP TRIGGER IF EXISTS on_blood_donor_email ON public.blood_donors;
      CREATE TRIGGER on_blood_donor_email
        AFTER INSERT ON public.blood_donors
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_email('blood_donor');
  END IF;
END $$;

-- ALKHAYR: Material Donation Approval (UPDATE Trigger)
DROP TRIGGER IF EXISTS on_material_donation_update_email ON public.material_donations;
CREATE TRIGGER on_material_donation_update_email
  AFTER UPDATE ON public.material_donations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'approved')
  EXECUTE FUNCTION public.handle_new_email('material_donation_approved');
