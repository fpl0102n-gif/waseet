-- Separate Trigger Functions for Reliability

-- 1. BLOOD Notification Function
CREATE OR REPLACE FUNCTION notify_blood_telegram()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  payload JSONB;
BEGIN
  -- Replace with your actual Project ID
  function_url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-telegram-notification'; 

  payload := jsonb_build_object(
    'type', 'blood',
    'record', to_jsonb(NEW)
  );

  PERFORM net.http_post(
    url := function_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := payload
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Blood notification failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. ORDERS Notification Function
CREATE OR REPLACE FUNCTION notify_order_telegram()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  payload JSONB;
BEGIN
  -- Replace with your actual Project ID
  function_url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-telegram-notification'; 

  payload := jsonb_build_object(
    'type', 'order',
    'record', to_jsonb(NEW)
  );

  PERFORM net.http_post(
    url := function_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := payload
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Order notification failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-create Triggers using specific functions
DROP TRIGGER IF EXISTS trg_notify_blood ON public.blood_donors;
CREATE TRIGGER trg_notify_blood
  AFTER INSERT ON public.blood_donors
  FOR EACH ROW EXECUTE FUNCTION notify_blood_telegram();

DROP TRIGGER IF EXISTS trg_notify_orders ON public.orders;
CREATE TRIGGER trg_notify_orders
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION notify_order_telegram();
