-- TEST V3 TRIGGER (Force Status Cycle)
-- This script changes the status of order 688196 to 'processing', waits, then sets it back.
-- This guarantees the WHEN condition is met.

DO $$
DECLARE
    dummy_id bigint := 688196;
BEGIN
    RAISE NOTICE 'Testing Order %', dummy_id;

    -- 1. Change to Processing (Should FIRE)
    UPDATE public.orders 
    SET status = 'processing' 
    WHERE id = dummy_id;
    
    -- 2. Wait to ensure log order
    PERFORM pg_sleep(0.5);

    -- 3. Change back to New (Should FIRE again)
    UPDATE public.orders 
    SET status = 'new' 
    WHERE id = dummy_id;

END $$;

-- Check Logs (Newest 5)
SELECT * FROM public.debug_email_logs ORDER BY id DESC LIMIT 5;
