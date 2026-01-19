-- Fix RLS for Foreign Medicine Requests
-- This ensures Admins (authenticated users) can SEE and EDIT foreign requests.

-- 1. Enable RLS (Ensure it is on)
ALTER TABLE public.foreign_medicine_requests ENABLE ROW LEVEL SECURITY;

-- 2. Allow Public Submission (INSERT) - Essential for the form to work
DROP POLICY IF EXISTS "Public can insert foreign requests" ON public.foreign_medicine_requests;
CREATE POLICY "Public can insert foreign requests"
ON public.foreign_medicine_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 3. Allow Admin Access (SELECT) - Essential for Admin Panel visibility
DROP POLICY IF EXISTS "Authenticated can view foreign requests" ON public.foreign_medicine_requests;
CREATE POLICY "Authenticated can view foreign requests"
ON public.foreign_medicine_requests
FOR SELECT
TO authenticated
USING (true);

-- 4. Allow Admin Access (UPDATE) - Essential for Editing/Approving
DROP POLICY IF EXISTS "Authenticated can update foreign requests" ON public.foreign_medicine_requests;
CREATE POLICY "Authenticated can update foreign requests"
ON public.foreign_medicine_requests
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Allow Admin Access (DELETE)
DROP POLICY IF EXISTS "Authenticated can delete foreign requests" ON public.foreign_medicine_requests;
CREATE POLICY "Authenticated can delete foreign requests"
ON public.foreign_medicine_requests
FOR DELETE
TO authenticated
USING (true);

-- 6. Notify Schema Reload
NOTIFY pgrst, 'reload schema';
