-- Create Profiles Table (if missing)
-- This table is required for AdminUsers.tsx to show names and emails

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create Trigger to auto-create profile on signup (Standard Supabase Pattern)
-- This ensures new users get a profile entry automatically
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

-- Drop trigger if exists to avoid duplication error (careful with name)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Backfill existing users (Optional but helpful)
-- This might fail if you don't have permissions to select from auth.users, 
-- but it's worth a try for a fix script.
-- INSERT INTO public.profiles (id, email)
-- SELECT id, email FROM auth.users
-- ON CONFLICT (id) DO NOTHING;

-- 5. Add RLS Policies
-- Allow users to view their own profile
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Allow Super Admins to view all (using our secure function)
-- Dependent on fix_infinite_recursion.sql being run first
DROP POLICY IF EXISTS "Super Admins can view all profiles" ON profiles;

CREATE POLICY "Super Admins can view all profiles" ON profiles
    FOR SELECT
    TO authenticated
    USING ( public.check_is_super_admin() );
