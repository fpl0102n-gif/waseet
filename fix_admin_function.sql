-- FIX ADMIN FUNCTION
-- The core issue: 'is_admin' only allowed 'admin' role, but users were migrated to 'super_admin'.
-- This broke RLS, preventing updates.

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
    AND role IN ('admin', 'super_admin') -- Allow BOTH roles
  )
$$;

SELECT 'Fixed is_admin function. UI updates should work now.' as status;
