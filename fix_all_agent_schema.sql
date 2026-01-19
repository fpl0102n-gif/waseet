-- Comprehensive Fix for Agent System Schema
-- This script ensures both 'agent_registrations' and 'agents' tables have all columns used by the frontend.

-- 1. Update 'agent_registrations' table (Public Form)
ALTER TABLE public.agent_registrations
ADD COLUMN IF NOT EXISTS telegram TEXT,
ADD COLUMN IF NOT EXISTS shipping_countries TEXT[],
ADD COLUMN IF NOT EXISTS shipment_frequency TEXT,
ADD COLUMN IF NOT EXISTS price_per_kg NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS currency TEXT,
ADD COLUMN IF NOT EXISTS pricing_type TEXT,
ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- 2. Update 'agents' table (Admin Created)
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS telegram TEXT,
ADD COLUMN IF NOT EXISTS shipping_countries TEXT[],
ADD COLUMN IF NOT EXISTS shipment_frequency TEXT,
ADD COLUMN IF NOT EXISTS price_per_kg NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS currency TEXT,
ADD COLUMN IF NOT EXISTS pricing_type TEXT,
ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- 3. Fix RLS Policies (Agent Registrations)
ALTER TABLE public.agent_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit agent registrations" ON public.agent_registrations;
DROP POLICY IF EXISTS "Admins can view and update registrations" ON public.agent_registrations;
DROP POLICY IF EXISTS "Anyone can create agent registration" ON public.agent_registrations; 
DROP POLICY IF EXISTS "Owner or admin view registration" ON public.agent_registrations;
DROP POLICY IF EXISTS "Owner update pending registration" ON public.agent_registrations;
DROP POLICY IF EXISTS "Admin manage registrations" ON public.agent_registrations;

-- Allow anyone (public/anon) to insert
CREATE POLICY "Public can submit agent registrations" 
ON public.agent_registrations FOR INSERT WITH CHECK (true);

-- Allow admins to do everything
CREATE POLICY "Admins can view and update registrations" 
ON public.agent_registrations FOR ALL 
USING (true);


-- 4. Fix RLS Policies (Agents)
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage agents" ON public.agents;

-- Allow admins to do everything with agents
CREATE POLICY "Admins manage agents" 
ON public.agents FOR ALL 
USING (true);

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
