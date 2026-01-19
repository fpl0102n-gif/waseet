-- Migration: add approval flag, contact columns, and admin notifications trigger
-- Run this in Supabase SQL editor or via the CLI

-- 1) Ensure needed columns exist on blood_donors
ALTER TABLE public.blood_donors
  ADD COLUMN IF NOT EXISTS approved_by_admin BOOLEAN DEFAULT false;

ALTER TABLE public.blood_donors
  ADD COLUMN IF NOT EXISTS contact_app TEXT CHECK (contact_app IN ('whatsapp','telegram','aucun')) DEFAULT 'aucun';

ALTER TABLE public.blood_donors
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

ALTER TABLE public.blood_donors
  ADD COLUMN IF NOT EXISTS telegram_username TEXT;

ALTER TABLE public.blood_donors
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.blood_donors
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2) Ensure updated_at trigger function exists
CREATE OR REPLACE FUNCTION public.update_blood_donors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blood_donors_updated_at ON public.blood_donors;
CREATE TRIGGER blood_donors_updated_at
  BEFORE UPDATE ON public.blood_donors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_blood_donors_updated_at();

-- 3) Create an admin notifications table so admin panel can list pending approvals
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id BIGSERIAL PRIMARY KEY,
  donor_id BIGINT REFERENCES public.blood_donors(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','seen','resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4) Create trigger to insert a notification when a new donor is created and not yet approved
CREATE OR REPLACE FUNCTION public.notify_admin_on_new_donor()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.approved_by_admin = false OR NEW.approved_by_admin IS NULL THEN
    INSERT INTO public.admin_notifications(donor_id, message)
    VALUES (NEW.id, 'Nouveau donneur en attente d''approbation');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notify_admin_after_insert ON public.blood_donors;
CREATE TRIGGER notify_admin_after_insert
  AFTER INSERT ON public.blood_donors
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_new_donor();

-- 5) Policy templates (choose the variant matching your project).
-- Option A: If you maintain an `admins` table with `user_id` (uuid), use these policies:
--
-- CREATE POLICY "Admins can view all donors"
--   ON public.blood_donors FOR SELECT
--   USING (EXISTS (SELECT 1 FROM public.admins WHERE public.admins.user_id = auth.uid()));
--
-- CREATE POLICY "Admins can update approval"
--   ON public.blood_donors FOR UPDATE
--   USING (EXISTS (SELECT 1 FROM public.admins WHERE public.admins.user_id = auth.uid()))
--   WITH CHECK (true);

-- Option B: If you add a custom JWT claim `role = 'admin'` to admin users, use these policies:
--
-- CREATE POLICY "Admins can view all donors (role claim)"
--   ON public.blood_donors FOR SELECT
--   USING (current_setting('request.jwt.claims.role', true) = 'admin');
--
-- CREATE POLICY "Admins can update approval (role claim)"
--   ON public.blood_donors FOR UPDATE
--   USING (current_setting('request.jwt.claims.role', true) = 'admin')
--   WITH CHECK (true);

-- Note: Keep the existing public policy that allows anyone to INSERT their own registration.

-- 6) Helpful queries to verify after running migration:
-- List columns:
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'blood_donors'
-- ORDER BY ordinal_position;

-- Check notifications:
-- SELECT * FROM public.admin_notifications ORDER BY created_at DESC LIMIT 50;
