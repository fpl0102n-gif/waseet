-- Robust fix for contact_type column migration
-- Explicitly creates a new column to assume the text values, drops the old enum column, and renames.

DO $$
BEGIN
    -- 1. LOCAL MEDICINE REQUESTS
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'local_medicine_requests' AND column_name = 'contact_type') THEN
        -- Add temp text column
        ALTER TABLE local_medicine_requests ADD COLUMN contact_type_new TEXT;
        
        -- Copy data (explicit cast to text should work for values)
        UPDATE local_medicine_requests SET contact_type_new = contact_type::text;
        
        -- Drop old column
        ALTER TABLE local_medicine_requests DROP COLUMN contact_type;
        
        -- Rename new column
        ALTER TABLE local_medicine_requests RENAME COLUMN contact_type_new TO contact_type;
    END IF;

    -- 2. FOREIGN MEDICINE REQUESTS
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foreign_medicine_requests' AND column_name = 'contact_type') THEN
        -- Add temp text column
        ALTER TABLE foreign_medicine_requests ADD COLUMN contact_type_new TEXT;
        
        -- Copy data
        UPDATE foreign_medicine_requests SET contact_type_new = contact_type::text;
        
        -- Drop old column
        ALTER TABLE foreign_medicine_requests DROP COLUMN contact_type;
        
        -- Rename new column
        ALTER TABLE foreign_medicine_requests RENAME COLUMN contact_type_new TO contact_type;
    END IF;
END $$;
