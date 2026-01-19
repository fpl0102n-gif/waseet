-- FIX MATERIAL DONATIONS TABLE
-- Updating schema to use standard column names (aligned with frontend refactor)

-- 1. Add standard columns if they don't exist
ALTER TABLE public.material_donations 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS whatsapp BOOLEAN,
ADD COLUMN IF NOT EXISTS telegram BOOLEAN;

-- 2. Migrate data from old columns (if they exist)
DO $$
BEGIN
  -- Migrate donor_name -> full_name
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'material_donations' AND column_name = 'donor_name') THEN
      UPDATE public.material_donations SET full_name = donor_name WHERE full_name IS NULL;
  END IF;

  -- Migrate donor_phone -> phone_number
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'material_donations' AND column_name = 'donor_phone') THEN
      UPDATE public.material_donations SET phone_number = donor_phone WHERE phone_number IS NULL;
  END IF;

  -- Migrate donor_email -> email
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'material_donations' AND column_name = 'donor_email') THEN
      UPDATE public.material_donations SET email = donor_email WHERE email IS NULL;
  END IF;
END $$;
