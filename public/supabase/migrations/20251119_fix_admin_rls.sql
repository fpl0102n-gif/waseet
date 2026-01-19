-- Vérifier et corriger les RLS policies pour Al-Khayr admin

-- 1. Vérifier les policies existantes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('local_medicine_requests', 'foreign_medicine_requests', 'diaspora_volunteers')
ORDER BY tablename, policyname;

-- 2. Donner accès complet aux admins pour UPDATE
-- Policy pour local_medicine_requests
DROP POLICY IF EXISTS "Admin can update local requests" ON public.local_medicine_requests;
CREATE POLICY "Admin can update local requests"
ON public.local_medicine_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Policy pour foreign_medicine_requests
DROP POLICY IF EXISTS "Admin can update foreign requests" ON public.foreign_medicine_requests;
CREATE POLICY "Admin can update foreign requests"
ON public.foreign_medicine_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Policy pour diaspora_volunteers
DROP POLICY IF EXISTS "Admin can update volunteers" ON public.diaspora_volunteers;
CREATE POLICY "Admin can update volunteers"
ON public.diaspora_volunteers
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- 3. Vérifier que l'utilisateur actuel est admin
SELECT id, email, role FROM public.users WHERE id = auth.uid();

-- 4. Test manual update
-- UPDATE public.local_medicine_requests 
-- SET approved = false, status = 'cancelled'
-- WHERE id = 8;
