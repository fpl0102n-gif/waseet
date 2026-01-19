-- CRITICAL WARNING: THIS SCRIPT DELETES ALL ALKHAYR DATA
-- IT IS IRREVERSIBLE. PROCEED ONLY IF YOU ARE SURE.

BEGIN;

-- 1. Truncate Tables (Cascade will handle foreign keys if set up correctly, but we list order just in case)
TRUNCATE TABLE public.request_images RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.local_medicine_requests RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.foreign_medicine_requests RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.diaspora_volunteers RESTART IDENTITY CASCADE;

-- 2. Verify deletion (optional, but good for logs)
-- SELECT count(*) FROM local_medicine_requests; -- Should be 0

COMMIT;

-- NOTE: Storage buckets (medicine-images, alkhayr-prescriptions) MUST be emptied manually via Supabase Dashboard.
-- SQL cannot delete files from Storage.
