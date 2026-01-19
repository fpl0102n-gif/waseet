-- Helper function to check for Humanitarian Admin role
-- This is needed for RLS policies

CREATE OR REPLACE FUNCTION public.check_is_humanitarian_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND (role = 'humanitarian_admin' OR role = 'super_admin') -- Super admins also qualify
      AND is_active = true
  );
END;
$$;
