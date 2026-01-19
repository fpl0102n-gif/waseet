DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'local_medicine_requests' AND column_name = 'email') THEN
        ALTER TABLE local_medicine_requests ADD COLUMN email TEXT;
    END IF;
END $$;
