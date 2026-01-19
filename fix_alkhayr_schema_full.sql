-- Add all potential missing admin columns to alkhayr_requests
ALTER TABLE public.alkhayr_requests 
ADD COLUMN IF NOT EXISTS admin_public_description TEXT,
ADD COLUMN IF NOT EXISTS public_notes TEXT,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private',
ADD COLUMN IF NOT EXISTS classification TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS visibility_settings JSONB DEFAULT '{"show_name": false, "show_city": true, "show_contact": false, "show_photos": true}',
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'normal';

-- Ensure foreign_medicine_requests also has them if they share logic
ALTER TABLE public.foreign_medicine_requests
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'normal';

-- Ensure local_medicine_requests also has them
ALTER TABLE public.local_medicine_requests
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'normal';


-- Notify schema reload
NOTIFY pgrst, 'reload schema';
