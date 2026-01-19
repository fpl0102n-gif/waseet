-- FIX PHONE CONSTRAINT
-- The database has a column named 'phone' (not donor_phone) and it is NOT NULL.
-- We verify its existence and remove the constraint.

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'material_donations' AND column_name = 'phone') THEN
        ALTER TABLE public.material_donations ALTER COLUMN phone DROP NOT NULL;
    END IF;
END $$;
