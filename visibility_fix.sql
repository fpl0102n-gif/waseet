-- 1. Force PUBLIC visibility for all existing requests (Local & Foreign)
-- This is necessary because the default might be private/null, and the public view FILTERS by visibility='public'.

UPDATE public.local_medicine_requests
SET visibility = 'public',
    status = 'pending' -- Ensure they are pending if they were null
WHERE visibility IS NULL OR visibility != 'public';

UPDATE public.foreign_medicine_requests
SET visibility = 'public',
    status = 'pending'
WHERE visibility IS NULL OR visibility != 'public';

-- 2. Ensure they are NOT rejected (just in case)
UPDATE public.local_medicine_requests SET status = 'pending' WHERE status = 'rejected';
UPDATE public.foreign_medicine_requests SET status = 'pending' WHERE status = 'rejected';

-- 3. Notify Schema Reload
NOTIFY pgrst, 'reload schema';
