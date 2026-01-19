-- CHECK V8 LOGS
-- See what URL the Hybrid logic calculated
SELECT id, message, details 
FROM public.debug_email_logs 
WHERE message LIKE '%V8%' OR message LIKE '%Failed%'
ORDER BY id DESC 
LIMIT 3;
