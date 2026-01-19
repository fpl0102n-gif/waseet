-- Setup Telegram Triggers FINAL
-- Run this AFTER deploying the edge function

-- 1. Create the Generic Trigger Function
CREATE OR REPLACE FUNCTION trigger_telegram_notification()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
  notification_type TEXT;
  function_url TEXT;
BEGIN
  -- Determine type based on table name
  IF TG_TABLE_NAME = 'local_medicine_requests' THEN
    notification_type := 'local_request';
  ELSIF TG_TABLE_NAME = 'foreign_medicine_requests' THEN
    notification_type := 'foreign_request';
  ELSIF TG_TABLE_NAME = 'diaspora_volunteers' THEN
    notification_type := 'diaspora_volunteer';
  ELSIF TG_TABLE_NAME = 'blood_donors' THEN
    notification_type := 'blood';
  ELSIF TG_TABLE_NAME = 'transport_volunteers' THEN
    notification_type := 'transport';
  ELSIF TG_TABLE_NAME = 'material_donations' THEN
    notification_type := 'material';
  ELSIF TG_TABLE_NAME = 'store_product_suggestions' THEN
    notification_type := 'store_suggestion';
  ELSIF TG_TABLE_NAME = 'orders' THEN
    notification_type := 'order';
  ELSE
    notification_type := 'unknown';
  END IF;

  payload := jsonb_build_object(
    'type', notification_type,
    'record', to_jsonb(NEW)
  );

  -- Replace with your actual Project ID
  function_url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-telegram-notification'; 

  -- Ensure pg_net is enabled
  PERFORM net.http_post(
    url := function_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := payload
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to trigger Telegram notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Create Triggers
-- Drop old ones first
DROP TRIGGER IF EXISTS trg_notify_local ON public.local_medicine_requests;
DROP TRIGGER IF EXISTS trg_notify_foreign ON public.foreign_medicine_requests;
DROP TRIGGER IF EXISTS trg_notify_diaspora ON public.diaspora_volunteers;
DROP TRIGGER IF EXISTS trg_notify_blood ON public.blood_donors;
DROP TRIGGER IF EXISTS trg_notify_transport ON public.transport_volunteers;
DROP TRIGGER IF EXISTS trg_notify_material ON public.material_donations;
DROP TRIGGER IF EXISTS trg_notify_suggestion ON public.store_product_suggestions;
DROP TRIGGER IF EXISTS trg_notify_orders ON public.orders;

-- Create new ones
CREATE TRIGGER trg_notify_local
  AFTER INSERT ON public.local_medicine_requests
  FOR EACH ROW EXECUTE FUNCTION trigger_telegram_notification();

CREATE TRIGGER trg_notify_foreign
  AFTER INSERT ON public.foreign_medicine_requests
  FOR EACH ROW EXECUTE FUNCTION trigger_telegram_notification();

CREATE TRIGGER trg_notify_diaspora
  AFTER INSERT ON public.diaspora_volunteers
  FOR EACH ROW EXECUTE FUNCTION trigger_telegram_notification();

CREATE TRIGGER trg_notify_blood
  AFTER INSERT ON public.blood_donors
  FOR EACH ROW EXECUTE FUNCTION trigger_telegram_notification();

CREATE TRIGGER trg_notify_transport
  AFTER INSERT ON public.transport_volunteers
  FOR EACH ROW EXECUTE FUNCTION trigger_telegram_notification();

CREATE TRIGGER trg_notify_material
  AFTER INSERT ON public.material_donations
  FOR EACH ROW EXECUTE FUNCTION trigger_telegram_notification();

CREATE TRIGGER trg_notify_suggestion
  AFTER INSERT ON public.store_product_suggestions
  FOR EACH ROW EXECUTE FUNCTION trigger_telegram_notification();

CREATE TRIGGER trg_notify_orders
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION trigger_telegram_notification();
