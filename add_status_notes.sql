-- Robust script to migrate status to TEXT and add user_notes

-- 1. LOCAL MEDICINE REQUESTS
DO $$ 
BEGIN
    -- Remove default to avoid type mismatch during conversion
    ALTER TABLE local_medicine_requests ALTER COLUMN status DROP DEFAULT;
    
    -- Convert to TEXT to allow any status (approved, reviewing, etc)
    ALTER TABLE local_medicine_requests ALTER COLUMN status TYPE TEXT USING status::text;
    
    -- Set default back to 'pending'
    ALTER TABLE local_medicine_requests ALTER COLUMN status SET DEFAULT 'pending';
    
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore if column doesn't exist yet, standard add will catch it
END $$;

ALTER TABLE local_medicine_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE local_medicine_requests ADD COLUMN IF NOT EXISTS user_notes TEXT;


-- 2. FOREIGN MEDICINE REQUESTS
DO $$ 
BEGIN
    ALTER TABLE foreign_medicine_requests ALTER COLUMN status DROP DEFAULT;
    ALTER TABLE foreign_medicine_requests ALTER COLUMN status TYPE TEXT USING status::text;
    ALTER TABLE foreign_medicine_requests ALTER COLUMN status SET DEFAULT 'pending';
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE foreign_medicine_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE foreign_medicine_requests ADD COLUMN IF NOT EXISTS user_notes TEXT;


-- 3. DIASPORA VOLUNTEERS
DO $$ 
BEGIN
    ALTER TABLE diaspora_volunteers ALTER COLUMN status DROP DEFAULT;
    ALTER TABLE diaspora_volunteers ALTER COLUMN status TYPE TEXT USING status::text;
    ALTER TABLE diaspora_volunteers ALTER COLUMN status SET DEFAULT 'pending';
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE diaspora_volunteers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE diaspora_volunteers ADD COLUMN IF NOT EXISTS user_notes TEXT;


-- 4. UPDATE DATA
UPDATE local_medicine_requests SET status = 'accepted' WHERE approved = true AND (status = 'pending' OR status IS NULL);
UPDATE foreign_medicine_requests SET status = 'accepted' WHERE approved = true AND (status = 'pending' OR status IS NULL);
UPDATE diaspora_volunteers SET status = 'accepted' WHERE approved = true AND (status = 'pending' OR status IS NULL);

-- 5. RELOAD SCHEMA CACHE (Fixes PGRST204 error)
NOTIFY pgrst, 'reload schema';
