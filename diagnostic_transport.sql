-- DIAGNOSTIC: Transport Volunteers and Triggers

-- 1. Check if the table and Trigger exist
SELECT 
    event_object_table as table_name, 
    trigger_name, 
    event_manipulation as event,
    action_statement as definition
FROM information_schema.triggers 
WHERE event_object_table = 'transport_volunteers';

-- 2. Check if the row was actually inserted (Last 3 entries)
SELECT id, full_name, email, created_at FROM public.transport_volunteers ORDER BY created_at DESC LIMIT 3;

-- 3. Check if debug_email_logs exists and has any data
SELECT count(*) as log_count FROM public.debug_email_logs;

-- 4. Test Permissions: Can we insert into logging table?
INSERT INTO public.debug_email_logs (message) VALUES ('Manual Test Log Entry');

-- 5. Test Function: Setup a fake notification manually
-- This simulates what the trigger does.
SELECT net.http_post(
      url := 'https://' || current_setting('request.headers')::json->>'x-forwarded-host' || '/functions/v1/send-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', current_setting('request.headers')::json->>'authorization'
      ),
      body := jsonb_build_object(
        'type', 'transport_volunteer',
        'record', '{"full_name": "Test User", "email": "test@debug.com"}'::jsonb
      )
    ) as request_status;
