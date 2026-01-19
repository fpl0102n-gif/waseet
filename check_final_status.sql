-- CHECK FINAL STATUS (FIXED)
-- 1. Did the user actually get saved?
SELECT count(*) as total_volunteers 
FROM public.transport_volunteers;

-- 2. Did the trigger fire? (Check logs table, using ID since created_at is missing)
SELECT * FROM public.debug_email_logs ORDER BY id DESC LIMIT 5;

-- 3. Check for specific error logs
SELECT * FROM public.debug_email_logs WHERE message LIKE '%Crash%' OR message LIKE '%Failed%';
