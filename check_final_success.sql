-- CHECK FINAL SUCCESS (V6 CHECK)
SELECT id, message, details 
FROM public.debug_email_logs 
WHERE message LIKE '%V6%' OR message LIKE '%Failed%'
ORDER BY id DESC 
LIMIT 3;
