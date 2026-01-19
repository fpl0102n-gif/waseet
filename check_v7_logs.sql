-- CHECK V7 LOGS
SELECT id, message, details 
FROM public.debug_email_logs 
WHERE message LIKE '%V7%'
ORDER BY id DESC 
LIMIT 3;
