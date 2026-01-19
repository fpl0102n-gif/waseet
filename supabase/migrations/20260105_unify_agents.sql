-- Migration: Unify Agent Registrations and Agents
-- Objective: Consolidate 'agent_registrations' into 'agents' table.
-- Strategy:
-- 1. Enhance 'agents' table with status, role, and missing fields.
-- 2. Migrate data from 'agent_registrations' to 'agents'.
-- 3. Archive 'agent_registrations' and create a compatibility view.

BEGIN;

-- 1. Enhance 'agents' table
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS role text DEFAULT 'agent',
ADD COLUMN IF NOT EXISTS goods_types text[],
ADD COLUMN IF NOT EXISTS shipping_methods text[],
ADD COLUMN IF NOT EXISTS shipping_countries text[];

-- Ensure registration_id exists (it should, based on usage)
-- If not, we add it. 
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'registration_id') THEN
        ALTER TABLE public.agents ADD COLUMN registration_id bigint;
    END IF;
END $$;

-- 2. Data Migration
-- Insert pending/rejected/other registrations that are NOT yet in agents table
INSERT INTO public.agents (
    registration_id,
    name,
    email,
    phone_whatsapp,
    telegram,
    country,
    city,
    shipping_countries,
    shipping_methods,
    shipment_frequency,
    goods_types,
    price_per_kg,
    currency,
    pricing_type,
    additional_notes,
    status,
    role,
    created_at,
    active
)
SELECT 
    id, -- registration_id
    name,
    email,
    phone_whatsapp,
    telegram,
    country,
    city,
    shipping_countries,
    shipping_methods,
    shipment_frequency,
    goods_types,
    price_per_kg,
    currency,
    pricing_type,
    additional_notes,
    status,
    'agent',
    created_at,
    (status = 'active') -- active bool
FROM public.agent_registrations
WHERE id NOT IN (SELECT registration_id FROM public.agents WHERE registration_id IS NOT NULL);

-- Update status for existing agents to match (if needed)
UPDATE public.agents
SET status = 'active'
WHERE status IS NULL;

-- 3. Archive and Shadow View
ALTER TABLE public.agent_registrations RENAME TO archived_agent_registrations;

-- Create View to mimic old table
-- We map agents.registration_id back to id to preserve legacy ID Lookups
CREATE OR REPLACE VIEW public.agent_registrations AS
SELECT 
    registration_id as id,
    name,
    email,
    phone_whatsapp,
    telegram,
    country,
    city,
    shipping_countries,
    shipping_methods,
    shipment_frequency,
    goods_types,
    price_per_kg,
    currency,
    pricing_type,
    additional_notes,
    status,
    status as notes, -- Placeholder if notes column was used for something else, checking schema... usage was 'admin_notes'.
    -- archived table had 'notes' (admin notes). agents has 'additional_notes'.
    created_at
FROM public.agents
WHERE registration_id IS NOT NULL;

-- Note: 'notes' column in archived table was Admin Notes.
-- 'additional_notes' in agents seems to be User Notes.
-- We need to check if 'agents' has an admin notes column.
-- AdminAgentRegistrationDetails.tsx inserts `adminNote` into... `logs` mostly. 
-- But it updates `agent_registrations.notes`.
-- So 'agents' table SHOULD have an admin `notes` column if we want to preserve it.

-- Correcting Plan: Add 'notes' to agents if missing.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'notes') THEN
        ALTER TABLE public.agents ADD COLUMN notes text;
    END IF;
END $$;

-- Re-run data migration for notes?
-- Since we already did INSERT above, we might have missed 'notes'.
-- Let's UPDATE the migrated rows with notes from archived table.
UPDATE public.agents a
SET notes = ar.notes
FROM public.archived_agent_registrations ar
WHERE a.registration_id = ar.id;

-- Re-create View with correct notes column
CREATE OR REPLACE VIEW public.agent_registrations AS
SELECT 
    registration_id as id,
    name,
    email,
    phone_whatsapp,
    telegram,
    country,
    city,
    shipping_countries,
    shipping_methods,
    shipment_frequency,
    goods_types,
    price_per_kg,
    currency,
    pricing_type,
    additional_notes,
    status,
    notes, -- Admin notes
    created_at
FROM public.agents
WHERE registration_id IS NOT NULL;

-- 4. RLS Policies
-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view active agents (for matching/search)
CREATE POLICY "Public agents are viewable" ON public.agents
    FOR SELECT USING (status = 'active');

-- Policy: Admin full access (assuming service_role or admin user)
-- For now, allow authenticated users to view (refined later based on auth implementation)
-- CREATE POLICY "Admins can do everything" ... 
-- Since we don't have exact auth roles yet, we keep it broad for 'service_role' and specific for 'authenticated'.

COMMIT;
