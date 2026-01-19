-- Backfill Profiles from Auth Users
-- Run this to verify existing users have a profile entry.
-- This requires high-level permissions (Supabase SQL Editor usually has them).

INSERT INTO public.profiles (id, email, first_name, last_name, created_at, updated_at)
SELECT 
    id, 
    email, 
    raw_user_meta_data->>'first_name', 
    raw_user_meta_data->>'last_name',
    created_at,
    COALESCE(last_sign_in_at, created_at) as updated_at
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET 
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;
