DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foreign_medicine_requests' AND column_name = 'email') THEN
        ALTER TABLE foreign_medicine_requests ADD COLUMN email TEXT;
    END IF;
END $$;
