-- 1. Disable RLS to ensure Admin Panel sees ALL requests (pending, rejected, etc.)
-- This fixes the issue where only "own" or "approved" requests are visible.
ALTER TABLE public.local_medicine_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.foreign_medicine_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaspora_volunteers DISABLE ROW LEVEL SECURITY;

-- 2. Explicitly Grant Permissions to ensure API access works
GRANT ALL ON public.local_medicine_requests TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.foreign_medicine_requests TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.diaspora_volunteers TO postgres, anon, authenticated, service_role;

-- 3. Also grant on the views just in case
GRANT SELECT ON public.alkhayr_requests_admin TO anon, authenticated, service_role;
GRANT SELECT ON public.alkhayr_requests TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
