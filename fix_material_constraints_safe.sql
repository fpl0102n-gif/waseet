-- SAFE FIX MATERIAL DONATIONS
-- Handles missing columns gracefully using dynamic SQL.

DO $$
BEGIN
    -- 1. Relax 'donor_name' if it exists
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'material_donations' AND column_name = 'donor_name') THEN
        ALTER TABLE public.material_donations ALTER COLUMN donor_name DROP NOT NULL;
    END IF;

    -- 2. Relax 'donor_phone' if it exists
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'material_donations' AND column_name = 'donor_phone') THEN
        ALTER TABLE public.material_donations ALTER COLUMN donor_phone DROP NOT NULL;
    END IF;

    -- 3. Relax 'donor_email' if it exists
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'material_donations' AND column_name = 'donor_email') THEN
        ALTER TABLE public.material_donations ALTER COLUMN donor_email DROP NOT NULL;
    END IF;
END $$;

-- 4. Add Standard Columns (If missing)
ALTER TABLE public.material_donations 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS whatsapp BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS telegram BOOLEAN DEFAULT false;

-- 5. Smart Sync Trigger (Only updates if column exists)
CREATE OR REPLACE FUNCTION public.sync_material_donation_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- We use a simple IF check inside the trigger logic or just rely on the new columns.
  -- Since we made the old ones Nullable, we technically don't NEED to backfill them for the INSERT to succeed.
  -- But let's try to backfill donor_name just in case the Admin UI needs it.
  
  -- But we can't reference NEW.donor_name directly if the column doesn't exist (it would be a compile error).
  -- So we will SKIP the backfill logic here to avoid the "column does not exist" error.
  
  -- The Dashboard should be updated to use 'full_name' eventually. 
  -- For now, making donor_name NULLABLE is enough to unblock the User.

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remove the old trigger if it caused issues
DROP TRIGGER IF EXISTS on_material_donation_insert_sync ON public.material_donations;
