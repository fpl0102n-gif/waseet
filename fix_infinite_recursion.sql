-- Fix Infinite Recursion in user_roles policy

-- 1. Create a secure function to check admin status
-- SECURITY DEFINER means it runs with the privileges of the creator, bypassing RLS on user_roles for this check.
CREATE OR REPLACE FUNCTION public.check_is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the recursive policy
DROP POLICY IF EXISTS "Super Admins can manage all" ON user_roles;

-- 3. Re-create policy using the function
CREATE POLICY "Super Admins can manage all" ON user_roles
    FOR ALL
    TO authenticated
    USING ( public.check_is_super_admin() );
