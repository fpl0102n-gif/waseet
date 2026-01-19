-- Migration: Normalize Exchange & Volunteers
-- Objective: Enforce Enums and implement strict privacy for volunteers using a View.

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

-- Drop potentially conflicting constraints (text based checks)
ALTER TABLE public.exchange_requests DROP CONSTRAINT IF EXISTS exchange_requests_status_check;
ALTER TABLE public.exchange_requests DROP CONSTRAINT IF EXISTS exchange_requests_type_check;

-- Cast Columns
ALTER TABLE public.exchange_requests 
    ALTER COLUMN status TYPE public.exchange_status_enum 
    USING status::public.exchange_status_enum;

ALTER TABLE public.exchange_requests 
    ALTER COLUMN request_type TYPE public.request_type_enum 
    USING request_type::public.request_type_enum;

-- Update RLS
ALTER TABLE public.exchange_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Public can insert
DROP POLICY IF EXISTS "Public can create exchange requests" ON public.exchange_requests;
CREATE POLICY "Public can create exchange requests" ON public.exchange_requests FOR INSERT WITH CHECK (true);

-- Policy: Admin read only (Adjust if users need to see their own via some token? Assuming Admin managed for now)
-- We do NOT allow public select on this table to prevent data scraping of phone numbers.


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

-- Drop potential constraints
ALTER TABLE public.transport_volunteers DROP CONSTRAINT IF EXISTS transport_volunteers_status_check;

-- Cast Columns
ALTER TABLE public.transport_volunteers 
    ALTER COLUMN status TYPE public.volunteer_status_enum 
    USING status::public.volunteer_status_enum;

-- Ensure RLS on Base Table (Strict Private)
ALTER TABLE public.transport_volunteers ENABLE ROW LEVEL SECURITY;

-- Policy: Public can insert (Join form)
DROP POLICY IF EXISTS "Public can apply as volunteer" ON public.transport_volunteers;
CREATE POLICY "Public can apply as volunteer" ON public.transport_volunteers FOR INSERT WITH CHECK (true);

-- Policy: Admin Full Access (Implicit for Service Role, but if using authenticated admin user:)
-- CREATE POLICY "Admins full access" ON public.transport_volunteers ...

-- Policy: NO PUBLIC SELECT on this table. 
-- We remove any existing public select policies.
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

-- Grant Access to the View (Anonymous)
GRANT SELECT ON public.active_transport_volunteers_view TO anon;
GRANT SELECT ON public.active_transport_volunteers_view TO authenticated;

COMMIT;
