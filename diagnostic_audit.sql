-- DIAGNOSTIC AUDIT
-- 1. Fix Permissions on Debug Table (Just in case)
GRANT ALL ON TABLE public.debug_email_logs TO postgres, anon, authenticated, service_role;
GRANT ALL ON SEQUENCE public.debug_email_logs_id_seq TO postgres, anon, authenticated, service_role;

-- 2. Force Update on the Known Order ID from your logs (688196)
DO $$
BEGIN
    RAISE NOTICE 'Updating Order 688196...';
    UPDATE public.orders 
    SET status = status -- No actual change, but touches the row
    WHERE id = 688196;
END $$;

-- 3. Check Logs (Newest First)
SELECT * FROM public.debug_email_logs ORDER BY id DESC LIMIT 5;
