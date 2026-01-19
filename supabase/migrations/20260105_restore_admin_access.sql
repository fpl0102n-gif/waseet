-- Migration: Restore Admin Access (RLS Fix)
-- Objective: Ensure Admins (via user_roles) have full access to hardened tables.

BEGIN;

-- 1. Helper Function for Admin Check (Optional but cleaner, or just use subquery)
-- We'll use the subquery method to be dependency-free.
-- (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'))

-- 2. Transport Volunteers
DROP POLICY IF EXISTS "Admins full access" ON public.transport_volunteers;
CREATE POLICY "Admins full access" ON public.transport_volunteers
    FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- 3. Exchange Requests
DROP POLICY IF EXISTS "Admins full access" ON public.exchange_requests;
CREATE POLICY "Admins full access" ON public.exchange_requests
    FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- 4. Blood Donors
DROP POLICY IF EXISTS "Admins full access" ON public.blood_donors;
CREATE POLICY "Admins full access" ON public.blood_donors
    FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- 5. Agents
DROP POLICY IF EXISTS "Admins full access" ON public.agents;
CREATE POLICY "Admins full access" ON public.agents
    FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- 6. Store Tables (Products, Orders, Suggestions)
DROP POLICY IF EXISTS "Admins full access" ON public.products;
CREATE POLICY "Admins full access" ON public.products
    FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Admins full access" ON public.orders;
CREATE POLICY "Admins full access" ON public.orders
    FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Admins full access" ON public.store_product_suggestions;
CREATE POLICY "Admins full access" ON public.store_product_suggestions
    FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

COMMIT;
