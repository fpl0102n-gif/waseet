-- CHECK ADMIN PERMISSIONS
-- The UI is failing to update the database because RLS thinks you are not an admin.
-- This script helps us verify and fix that.

-- 1. Check who is an admin currently
SELECT * FROM public.user_roles;

-- 2. Check the definition of 'is_admin' (to be sure)
SELECT pg_get_functiondef('public.is_admin'::regproc);

-- 3. INSTRUCTION:
-- If your User ID is NOT in the list above, run the following command (replace YOUR_USER_ID):
-- INSERT INTO public.user_roles (user_id, role) VALUES ('YOUR_USER_ID_HERE', 'admin');
