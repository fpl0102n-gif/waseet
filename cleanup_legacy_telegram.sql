-- Cleanup Legacy Telegram Artifacts

-- 1. Drop Triggers on local_medicine_requests
DROP TRIGGER IF EXISTS trigger_notify_local_request ON public.local_medicine_requests;

-- 2. Drop Triggers on foreign_medicine_requests
DROP TRIGGER IF EXISTS trigger_notify_foreign_request ON public.foreign_medicine_requests;

-- 3. Drop Triggers on diaspora_volunteers
DROP TRIGGER IF EXISTS trigger_notify_volunteer ON public.diaspora_volunteers;

-- 4. Drop the notification function
DROP FUNCTION IF EXISTS notify_alkhayr_telegram();

-- 5. Drop the settings table if it exists (assuming it was only used for telegram_notification_url)
-- If it has other keys, we should only delete the key. 
-- Checking the definition, it was created specifically for this feature in 20251119_add_telegram_notifications.sql
DROP TABLE IF EXISTS public.alkhayr_settings;

-- 6. Clean up any related columns if they were purely for the old system
-- (admin_notes is useful, so we keep it. Only removing purely technical debt)

NOTIFY pgrst, 'reload schema';
