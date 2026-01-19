-- Workaround for "Could not find medicine_details" error
-- We add the column to the table so the API is happy, even if we don't use it.

ALTER TABLE public.local_medicine_requests 
ADD COLUMN IF NOT EXISTS medicine_details TEXT;

-- Also verify other potentially missing columns that might cause issues
ALTER TABLE public.local_medicine_requests 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS category TEXT;

-- Force schema reload
NOTIFY pgrst, 'reload schema';
