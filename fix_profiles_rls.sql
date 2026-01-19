-- Allow Super Admins to view all profiles
-- This is necessary for the Admin Users page to show names and emails

-- 1. Enable RLS on profiles if not already enabled (it usually is)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policy if it conflicts or is too narrow
DROP POLICY IF EXISTS "Super Admins can view all profiles" ON profiles;

-- 3. Create the policy
-- We reuse the secure function we created earlier to check permissions
CREATE POLICY "Super Admins can view all profiles" ON profiles
    FOR SELECT
    TO authenticated
    USING ( public.check_is_super_admin() );
