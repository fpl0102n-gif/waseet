-- Add status column to blood_donors table
-- We check if column exists first to be safe, though standard SQL doesn't have "ADD COLUMN IF NOT EXISTS" in all versions, PG 9.6+ does.

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blood_donors' AND column_name = 'status') THEN
        ALTER TABLE blood_donors ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
        
        -- Serialize existing data
        -- If approved_by_admin is true, set status to approved
        UPDATE blood_donors SET status = 'approved' WHERE approved_by_admin = true;
        -- If approved_by_admin is false, set status to pending (default is matched, but explicit is good)
        UPDATE blood_donors SET status = 'pending' WHERE approved_by_admin = false;
    END IF;
END $$;
