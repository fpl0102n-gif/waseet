-- DIAGNOSTIC: DISABLE RLS TEMPORARILY
-- This will confirm if Permissions are the blocker.

ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

SELECT 'RLS DISABLED on Orders. Please Try "Save" in UI now.' as status;
