-- Force Hard Schema Cache Refresh
-- By modifying the table structure, we force PostgREST to rebuild its cache for this table.

-- 1. Add a dummy column
ALTER TABLE public.local_medicine_requests ADD COLUMN IF NOT EXISTS _cache_buster integer;

-- 2. Notify reload (just in case)
NOTIFY pgrst, 'reload schema';

-- 3. Drop the dummy column
ALTER TABLE public.local_medicine_requests DROP COLUMN IF EXISTS _cache_buster;

-- 4. Notify reload again
NOTIFY pgrst, 'reload schema';
