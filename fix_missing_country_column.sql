-- Add missing country column to foreign_medicine_requests
ALTER TABLE public.foreign_medicine_requests 
ADD COLUMN IF NOT EXISTS country TEXT;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
