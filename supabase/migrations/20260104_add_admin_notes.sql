-- Migration: Add Admin Notes to Alkhayr Requests

-- 1. Ensure 'admin_notes' column exists in local_medicine_requests
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'local_medicine_requests' AND column_name = 'admin_notes') THEN
        ALTER TABLE public.local_medicine_requests ADD COLUMN admin_notes TEXT;
    END IF;
END $$;

-- 2. Ensure 'admin_notes' column exists in foreign_medicine_requests
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foreign_medicine_requests' AND column_name = 'admin_notes') THEN
        ALTER TABLE public.foreign_medicine_requests ADD COLUMN admin_notes TEXT;
    END IF;
END $$;
