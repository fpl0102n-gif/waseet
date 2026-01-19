-- Add wilaya_id column to local_medicine_requests
ALTER TABLE local_medicine_requests 
ADD COLUMN IF NOT EXISTS wilaya_id integer;

-- Add wilaya_id column to foreign_medicine_requests
ALTER TABLE foreign_medicine_requests 
ADD COLUMN IF NOT EXISTS wilaya_id integer;

-- Refresh the schema cache (handled automatically by Supabase usually, but good to know)
NOTIFY pgrst, 'reload schema';
