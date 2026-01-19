-- DISABLE Duplicate Emails: Remove DB Triggers for Alkhayr
-- We are switching back to Client-Side email sending for reliability and better logging.
-- To prevent duplicates, we DROP the triggers that might be firing in the background.

-- 1. Drop trigger on the unified table
DROP TRIGGER IF EXISTS on_medicine_request_insert ON public.medicine_requests;

-- 2. Drop triggers on legacy tables (just in case they exist/fire)
DROP TRIGGER IF EXISTS on_alkhayr_local_email ON public.local_medicine_requests;
DROP TRIGGER IF EXISTS on_alkhayr_foreign_email ON public.foreign_medicine_requests;

-- 3. Drop status update triggers if they are causing noise (keeping them is fine if they only fire on update)
-- Keeping update triggers: on_alkhayr_status_update
