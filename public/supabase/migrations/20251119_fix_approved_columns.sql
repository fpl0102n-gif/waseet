-- Fix: Add approved columns to Al-Khayr tables
-- Run this in Supabase SQL Editor

-- For local_medicine_requests
ALTER TABLE public.local_medicine_requests
ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- For foreign_medicine_requests
ALTER TABLE public.foreign_medicine_requests
ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- For diaspora_volunteers
ALTER TABLE public.diaspora_volunteers
ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_local_medicine_approved ON public.local_medicine_requests(approved);
CREATE INDEX IF NOT EXISTS idx_foreign_medicine_approved ON public.foreign_medicine_requests(approved);
CREATE INDEX IF NOT EXISTS idx_diaspora_volunteers_approved ON public.diaspora_volunteers(approved);

-- Verify
SELECT 
    'local_medicine_requests' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'local_medicine_requests' 
AND column_name IN ('approved', 'approved_at', 'approved_by', 'admin_notes')
UNION ALL
SELECT 
    'foreign_medicine_requests',
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'foreign_medicine_requests' 
AND column_name IN ('approved', 'approved_at', 'approved_by', 'admin_notes')
UNION ALL
SELECT 
    'diaspora_volunteers',
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'diaspora_volunteers' 
AND column_name IN ('approved', 'approved_at', 'approved_by', 'admin_notes');
