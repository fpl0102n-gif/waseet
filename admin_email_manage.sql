-- Admin User Management RPCs
-- These functions allow Super Admins to view full user details (including auth status) and manage them.

-- 1. Get Full User List (RPC)
-- Joins user_roles, profiles, and auth.users to get a complete picture.
CREATE OR REPLACE FUNCTION public.get_admin_users_full()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    role app_role,
    is_active BOOLEAN,
    email_confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    last_sign_in_at TIMESTAMP WITH TIME ZONE
) 
SECURITY DEFINER -- Critical: Runs with creator permissions to access auth.users
AS $$
BEGIN
  -- Security Check: Only Super Admins can run this
  IF NOT public.check_is_super_admin() THEN
    RAISE EXCEPTION 'Access Denied: Super Admin permissions required.';
  END IF;

  RETURN QUERY
  SELECT 
    ur.user_id,
    p.email, -- Use profile email as primary display
    p.first_name,
    p.last_name,
    ur.role,
    ur.is_active,
    au.email_confirmed_at,
    ur.created_at,
    au.last_sign_in_at
  FROM public.user_roles ur
  LEFT JOIN public.profiles p ON p.id = ur.user_id
  LEFT JOIN auth.users au ON au.id = ur.user_id
  ORDER BY ur.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 2. Confirm User Email (RPC)
-- Allows a Super Admin to manually confirm a user's email address.
CREATE OR REPLACE FUNCTION public.admin_confirm_user_email(target_user_id UUID)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
  -- Security Check
  IF NOT public.check_is_super_admin() THEN
    RAISE EXCEPTION 'Access Denied: Super Admin permissions required.';
  END IF;

  -- Update auth.users
  UPDATE auth.users
  SET email_confirmed_at = now(),
      updated_at = now()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql;
