-- CHECK FINAL LOGS
-- We expect to see "V4 Trigger: Row Touched"
SELECT * FROM public.debug_email_logs ORDER BY id DESC LIMIT 5;
