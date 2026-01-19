-- Consolidated Fix for Missing Emails in Admin Panel
-- Run this entire script to ensure Profiles exist and are visible.

-- 1. Ensure Profiles Table Exists
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Ensure Security Function Exists (for RLS)
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

-- 3. Fix RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View own profile" ON profiles;
DROP POLICY IF EXISTS "Super Admins view all" ON profiles;
DROP POLICY IF EXISTS "Super Admins can view all profiles" ON profiles; -- Drop old name variants

-- Policy: Users see themselves
CREATE POLICY "View own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Policy: Super Admins see everyone
CREATE POLICY "Super Admins view all" ON profiles
    FOR SELECT USING ( public.check_is_super_admin() );

-- 4. Backfill Data (Populate Emails)
INSERT INTO public.profiles (id, email, first_name, last_name, created_at, updated_at)
SELECT 
    id, 
    email, 
    raw_user_meta_data->>'first_name', 
    raw_user_meta_data->>'last_name',
    created_at,
    COALESCE(last_sign_in_at, created_at)
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET 
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;

-- 5. Ensure Trigger for Future Users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
