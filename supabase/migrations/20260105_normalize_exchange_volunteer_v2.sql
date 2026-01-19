-- Migration: Normalize Exchange & Volunteers (V2 - Fix Default Cast Error)
-- Objective: Enforce Enums and implement strict privacy, handling Default Value casting issues.

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

-- DROP DEFAULTS First (Crucial Step for Error 42804)
ALTER TABLE public.exchange_requests ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.exchange_requests ALTER COLUMN request_type DROP DEFAULT;

-- Drop potentially conflicting constraints
ALTER TABLE public.exchange_requests DROP CONSTRAINT IF EXISTS exchange_requests_status_check;
ALTER TABLE public.exchange_requests DROP CONSTRAINT IF EXISTS exchange_requests_type_check;

-- Cast Columns
ALTER TABLE public.exchange_requests 
    ALTER COLUMN status TYPE public.exchange_status_enum 
    USING status::public.exchange_status_enum;

ALTER TABLE public.exchange_requests 
    ALTER COLUMN request_type TYPE public.request_type_enum 
    USING request_type::public.request_type_enum;

-- RESTORE DEFAULTS (Cast to Enum)
ALTER TABLE public.exchange_requests ALTER COLUMN status SET DEFAULT 'pending'::public.exchange_status_enum;
-- Request type usually doesn't have a safe default (user must choose), but if it did, set it here.

-- Update RLS
ALTER TABLE public.exchange_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can create exchange requests" ON public.exchange_requests;
CREATE POLICY "Public can create exchange requests" ON public.exchange_requests FOR INSERT WITH CHECK (true);


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

-- DROP DEFAULTS
ALTER TABLE public.transport_volunteers ALTER COLUMN status DROP DEFAULT;

-- Drop potential constraints
ALTER TABLE public.transport_volunteers DROP CONSTRAINT IF EXISTS transport_volunteers_status_check;

-- Cast Columns
ALTER TABLE public.transport_volunteers 
    ALTER COLUMN status TYPE public.volunteer_status_enum 
    USING status::public.volunteer_status_enum;

-- RESTORE DEFAULTS
ALTER TABLE public.transport_volunteers ALTER COLUMN status SET DEFAULT 'pending'::public.volunteer_status_enum;

-- Ensure RLS on Base Table
ALTER TABLE public.transport_volunteers ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public can apply as volunteer" ON public.transport_volunteers;
CREATE POLICY "Public can apply as volunteer" ON public.transport_volunteers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public view active volunteers" ON public.transport_volunteers;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.transport_volunteers;

-- Create Secure View for Public
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
