-- Migration: Add Status Columns and Email Triggers for Alkhayr Requests

-- 1. Ensure 'status' column exists in local_medicine_requests
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'local_medicine_requests' AND column_name = 'status') THEN
        ALTER TABLE public.local_medicine_requests ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- 2. Ensure 'status' column exists in foreign_medicine_requests
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foreign_medicine_requests' AND column_name = 'status') THEN
        ALTER TABLE public.foreign_medicine_requests ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- 3. Create Trigger for LOCAL requests
DROP TRIGGER IF EXISTS on_local_medicine_status_update ON public.local_medicine_requests;
CREATE TRIGGER on_local_medicine_status_update
    AFTER UPDATE ON public.local_medicine_requests
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.handle_new_email('alkhayr_request_update');

-- 4. Create Trigger for FOREIGN requests
DROP TRIGGER IF EXISTS on_foreign_medicine_status_update ON public.foreign_medicine_requests;
CREATE TRIGGER on_foreign_medicine_status_update
    AFTER UPDATE ON public.foreign_medicine_requests
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.handle_new_email('alkhayr_request_update');
