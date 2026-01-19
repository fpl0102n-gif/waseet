-- CHECK ORDER LOGS
SELECT id, message, details 
FROM public.debug_email_logs 
WHERE details->>'type' = 'order' OR message LIKE '%order%'
ORDER BY id DESC 
LIMIT 3;
