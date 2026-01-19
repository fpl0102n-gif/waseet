-- ============================================================
-- FINAL SECURITY AUDIT V2 (Post-Hardening)
-- ============================================================

-- 1. ARCHIVED TABLES CHECK
-- Must NOT have INSERT/UPDATE/DELETE policies.
-- Must NOT have 'anon' or 'public' roles in policies (unless restricted).
SELECT tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename LIKE 'archived_%';

-- 2. MEDICINE & ORDERS CHECK
-- Must NOT have policies visible to 'anon' (Public).
SELECT tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('medicine_requests', 'orders')
AND (roles @> '{anon}'::name[] OR roles @> '{public}'::name[]);

-- 3. PERMISSIVE POLICY CHECK
-- Find policies with "true" that might be too open.
-- (Simple Check constraint looking for literal 'true' string in qual)
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE (qual LIKE '%true%' OR with_check LIKE '%true%')
AND tablename IN ('agents', 'exchange_requests', 'transport_volunteers', 'blood_donors', 'orders', 'medicine_requests')
-- Exclude known safe inserts
AND NOT (cmd = 'INSERT');

-- 4. VIEW DEFINITION CHECK
-- Re-verify the view is secure
SELECT table_name, view_definition 
FROM information_schema.views 
WHERE table_name = 'active_transport_volunteers_view';
