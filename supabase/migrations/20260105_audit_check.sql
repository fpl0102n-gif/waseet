-- ============================================================
-- FINAL SECURITY & INTEGRITY AUDIT SCRIPT
-- ============================================================
-- Run this script in the Supabase SQL Editor.
-- It does NOT modify data. It returns diagnostic information.

-- 1. RLS POLICY AUDIT
-- Confirm that "enable_row_security" is TRUE and policies exist.
SELECT 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE tablename IN ('agents', 'exchange_requests', 'transport_volunteers', 'blood_donors', 'products', 'orders')
ORDER BY tablename, policyname;

-- EXPECTED RESULTS:
-- agents: "Admins full access" (ALL), "Public agents are viewable" (SELECT)
-- exchange_requests: "Admins full access", "Public can create", "Users can update own..."
-- transport_volunteers: "Admins full access", "Public can apply" (Note: NO public select)
-- blood_donors: "Admins full access", "Public can register", "Public can view active"
-- products/orders: "Admins full access"

-- 2. TRIGGER AUDIT
-- List triggers to ensure no rogue triggers exist on these tables.
SELECT 
    event_object_table as table_name, 
    trigger_name, 
    action_timing, 
    event_manipulation 
FROM information_schema.triggers
WHERE event_object_table IN ('agents', 'exchange_requests', 'transport_volunteers', 'blood_donors', 'orders')
ORDER BY table_name;

-- 3. DUPLICATE AGENT CHECK
-- Check if any agents have the same Email or Phone (indicating duplicate registrations)
SELECT email, COUNT(*) 
FROM public.agents 
GROUP BY email 
HAVING COUNT(*) > 1;

SELECT phone_whatsapp, COUNT(*) 
FROM public.agents 
GROUP BY phone_whatsapp 
HAVING COUNT(*) > 1;

-- 4. ENUM VERIFICATION
-- Verify that columns are using the correct Enums
SELECT table_name, column_name, udt_name 
FROM information_schema.columns 
WHERE table_name IN ('exchange_requests', 'transport_volunteers', 'blood_donors') 
AND column_name IN ('status', 'request_type', 'blood_type');

-- EXPECTED UDT_NAMES:
-- exchange_requests.status -> exchange_status_enum
-- exchange_requests.request_type -> request_type_enum
-- transport_volunteers.status -> volunteer_status_enum
-- blood_donors.blood_type -> blood_type_enum

-- 5. ACCESS CHECK FOR VIEW
-- Verify the Volunteers View exists
SELECT table_name, view_definition 
FROM information_schema.views 
WHERE table_name = 'active_transport_volunteers_view';
