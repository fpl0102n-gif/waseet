-- Migration: Harden Blood Donors Shema (V2 - Fix Constraint Issue)
-- Objective: Enforce data consistency with Enums and RLS, while handling existing constraints.

BEGIN;

-- 1. Create Blood Type Enum if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'blood_type_enum') THEN
        CREATE TYPE public.blood_type_enum AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
    END IF;
END $$;

-- 2. Drop existing Text-based Constraint that causes the error
-- The error "operator does not exist: blood_type_enum = text" usually implies a CHECK constraint or Default value
-- is still treating the column literal as text during the conversion.
ALTER TABLE public.blood_donors DROP CONSTRAINT IF EXISTS blood_donors_blood_type_check;
-- Also drop any other likely constraints if they exist (Supabase sometimes names them generically)
-- If we can't guess the name, we might need to rely on the user to check, but usually it's `table_column_check`.

-- 3. Alter table to use Enum (Safe Cast)
ALTER TABLE public.blood_donors 
    ALTER COLUMN blood_type TYPE public.blood_type_enum 
    USING blood_type::public.blood_type_enum;

-- 4. Ensure other columns exist
ALTER TABLE public.blood_donors 
    ADD COLUMN IF NOT EXISTS last_donation_date date,
    ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
    ADD COLUMN IF NOT EXISTS approved_by_admin boolean DEFAULT false;

-- 5. RLS Policies
ALTER TABLE public.blood_donors ENABLE ROW LEVEL SECURITY;

-- Allow public to register (Insert) - Drop if exists to avoid duplication errors if re-running
DROP POLICY IF EXISTS "Public can register as donor" ON public.blood_donors;
CREATE POLICY "Public can register as donor" ON public.blood_donors
    FOR INSERT WITH CHECK (true);

-- Allow public to view active donors
DROP POLICY IF EXISTS "Public can view active donors" ON public.blood_donors;
CREATE POLICY "Public can view active donors" ON public.blood_donors
    FOR SELECT USING (is_active = true AND approved_by_admin = true); 

COMMIT;
