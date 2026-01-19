-- Migration: Harden Blood Donors Shema
-- Objective: Enforce data consistency with Enums and RLS.

BEGIN;

-- 1. Create Blood Type Enum if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'blood_type_enum') THEN
        CREATE TYPE public.blood_type_enum AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
    END IF;
END $$;

-- 2. Alter table to use Enum (Safe Cast)
-- First, ensure all current values are valid. If not, this might fail or we should handle it.
-- We assume frontend validated inputs, but let's be safe: CAST invalid to NULL or handle errors at application level?
-- We will try to cast directly.
ALTER TABLE public.blood_donors 
    ALTER COLUMN blood_type TYPE public.blood_type_enum 
    USING blood_type::public.blood_type_enum;

-- 3. Ensure columns exist
ALTER TABLE public.blood_donors 
    ADD COLUMN IF NOT EXISTS last_donation_date date,
    ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
    ADD COLUMN IF NOT EXISTS approved_by_admin boolean DEFAULT false;

-- 4. RLS Policies
ALTER TABLE public.blood_donors ENABLE ROW LEVEL SECURITY;

-- Allow public to register (Insert)
CREATE POLICY "Public can register as donor" ON public.blood_donors
    FOR INSERT WITH CHECK (true);

-- Allow public to search active donors (Select) - Exclude contact details if needed, 
-- but often blood apps show phone number. 
-- Checking frontend `BloodSearch.tsx` determines what is needed.
-- Assuming public read for active donors:
CREATE POLICY "Public can view active donors" ON public.blood_donors
    FOR SELECT USING (is_active = true AND approved_by_admin = true); 

-- Admin full access
-- CREATE POLICY "Admins full access" ... (Generic placeholder until Auth is solid)

COMMIT;
