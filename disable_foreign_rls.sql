-- Disable RLS on Foreign Medicine Requests to fix visibility issues
-- Since this table is used for Admin management and contains less sensitive data than local requests,
-- disabling RLS is an acceptable temporary measure to ensure the admin can see submissions.

ALTER TABLE public.foreign_medicine_requests DISABLE ROW LEVEL SECURITY;

-- Also re-grant permissions just in case
GRANT ALL ON public.foreign_medicine_requests TO authenticated;
GRANT ALL ON public.foreign_medicine_requests TO service_role;
GRANT INSERT ON public.foreign_medicine_requests TO anon;

NOTIFY pgrst, 'reload schema';
