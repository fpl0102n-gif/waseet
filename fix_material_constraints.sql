-- FIX MATERIAL DONATIONS CONSTRAINTS
-- The backend still demands 'donor_name' (Old Schema), but we are sending 'full_name' (New Schema).
-- We must RELAX the old constraints to allow the new code to work.

-- 1. Remove NOT NULL constraints from old columns
ALTER TABLE public.material_donations 
ALTER COLUMN donor_name DROP NOT NULL,
ALTER COLUMN donor_phone DROP NOT NULL;

-- 2. Ensure new columns exist (Double Check)
ALTER TABLE public.material_donations 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS whatsapp BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS telegram BOOLEAN DEFAULT false;

-- 3. Sync data trigger (Optional, keeps old columns populated for safety)
-- This ensures if any existing dashboard code relies on 'donor_name', it still works.
CREATE OR REPLACE FUNCTION public.sync_material_donation_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- If new columns are present, backfill old columns
  IF NEW.full_name IS NOT NULL THEN
    NEW.donor_name := NEW.full_name;
  END IF;
  
  IF NEW.phone_number IS NOT NULL THEN
    NEW.donor_phone := NEW.phone_number;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_material_donation_insert_sync ON public.material_donations;
CREATE TRIGGER on_material_donation_insert_sync
BEFORE INSERT ON public.material_donations
FOR EACH ROW
EXECUTE FUNCTION public.sync_material_donation_columns();
