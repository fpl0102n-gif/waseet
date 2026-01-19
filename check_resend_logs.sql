-- CHECK ALL EMAIL LOGS (No Filtering)
-- This ensures we see "Aborting" messages too.
SELECT * FROM public.debug_email_logs 
ORDER BY id DESC 
LIMIT 10;
