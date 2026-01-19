-- Migration: Normalize Exchange & Volunteers (V3 - Fix Policy Dependency)
-- Objective: Enforce Enums and implement strict privacy, handling Policy Dependencies.

BEGIN;

-- ==========================================
-- 1. Exchange Module
-- ==========================================

-- Create Enums
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exchange_status_enum') THEN
        CREATE TYPE public.exchange_status_enum AS ENUM ('pending', 'matched', 'completed', 'cancelled', 'rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_type_enum') THEN
        CREATE TYPE public.request_type_enum AS ENUM ('buy', 'sell');
    END IF;
END $$;

-- DROP POLICIES Blocking Alter (Crucial Step for Error 0A000)
DROP POLICY IF EXISTS "Users can update own pending requests" ON public.exchange_requests;
DROP POLICY IF EXISTS "Public can create exchange requests" ON public.exchange_requests;
-- Drop others just in case
DROP POLICY IF EXISTS "Enable read access for all users" ON public.exchange_requests;
DROP POLICY IF EXISTS "Admins can view all" ON public.exchange_requests;


-- DROP DEFAULTS
ALTER TABLE public.exchange_requests ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.exchange_requests ALTER COLUMN request_type DROP DEFAULT;

-- Drop constraints
ALTER TABLE public.exchange_requests DROP CONSTRAINT IF EXISTS exchange_requests_status_check;
ALTER TABLE public.exchange_requests DROP CONSTRAINT IF EXISTS exchange_requests_type_check;

-- Cast Columns
ALTER TABLE public.exchange_requests 
    ALTER COLUMN status TYPE public.exchange_status_enum 
    USING status::public.exchange_status_enum;

ALTER TABLE public.exchange_requests 
    ALTER COLUMN request_type TYPE public.request_type_enum 
    USING request_type::public.request_type_enum;

-- RESTORE DEFAULTS
ALTER TABLE public.exchange_requests ALTER COLUMN status SET DEFAULT 'pending'::public.exchange_status_enum;

-- Update RLS & PROTECT
ALTER TABLE public.exchange_requests ENABLE ROW LEVEL SECURITY;

-- Re-Create Policies
-- 1. Insert (Public)
CREATE POLICY "Public can create exchange requests" ON public.exchange_requests 
    FOR INSERT WITH CHECK (true);

-- 2. Update (Own Pending) - The one that blocked us
-- Assuming there is a user_id or similar. If not, this policy might fail to create if schema differs.
-- We'll check if user_id exists implicitly.
-- "Users can update own pending requests" usually implies: auth.uid() = user_id AND status = 'pending'
-- We wrap in dynamic check to be safe, or just recreate it if we are sure.
-- Safer: allow public insert, but maybe only admin update? 
-- If the user had this policy, they likely want it back.
-- We will try to recreate it using the new Enum type.
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exchange_requests' AND column_name = 'user_id') THEN
        CREATE POLICY "Users can update own pending requests" ON public.exchange_requests
            FOR UPDATE USING (auth.uid() = user_id AND status = 'pending'::public.exchange_status_enum);
    END IF;
END $$;


-- ==========================================
-- 2. Transport Volunteers Module
-- ==========================================

-- Create Enums
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'volunteer_status_enum') THEN
        CREATE TYPE public.volunteer_status_enum AS ENUM ('pending', 'active', 'rejected', 'inactive');
    END IF;
END $$;

-- DROP BLOCKING POLICIES (Just in case)
DROP POLICY IF EXISTS "Public can apply as volunteer" ON public.transport_volunteers;
DROP POLICY IF EXISTS "Public view active volunteers" ON public.transport_volunteers;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.transport_volunteers;

-- DROP DEFAULTS
ALTER TABLE public.transport_volunteers ALTER COLUMN status DROP DEFAULT;

-- Drop constraints
ALTER TABLE public.transport_volunteers DROP CONSTRAINT IF EXISTS transport_volunteers_status_check;

-- Cast Columns
ALTER TABLE public.transport_volunteers 
    ALTER COLUMN status TYPE public.volunteer_status_enum 
    USING status::public.volunteer_status_enum;

-- RESTORE DEFAULTS
ALTER TABLE public.transport_volunteers ALTER COLUMN status SET DEFAULT 'pending'::public.volunteer_status_enum;

-- Ensure RLS
ALTER TABLE public.transport_volunteers ENABLE ROW LEVEL SECURITY;

-- Re-Create Policies
CREATE POLICY "Public can apply as volunteer" ON public.transport_volunteers FOR INSERT WITH CHECK (true);

-- Create Secure View for Public (as planned)
CREATE OR REPLACE VIEW public.active_transport_volunteers_view AS
SELECT 
    id,
    display_initials,
    display_location,
    display_description,
    city,
    wilaya,
    created_at
FROM public.transport_volunteers
WHERE status = 'active' AND is_available = true;

-- Grant Access
GRANT SELECT ON public.active_transport_volunteers_view TO anon;
GRANT SELECT ON public.active_transport_volunteers_view TO authenticated;

COMMIT;
