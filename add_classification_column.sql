DO $$
BEGIN
    -- Add classification to local_medicine_requests
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'local_medicine_requests' AND column_name = 'classification') THEN
        ALTER TABLE local_medicine_requests ADD COLUMN classification TEXT;
    END IF;

    -- Add classification to foreign_medicine_requests
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foreign_medicine_requests' AND column_name = 'classification') THEN
        ALTER TABLE foreign_medicine_requests ADD COLUMN classification TEXT;
    END IF;
END $$;

-- Robust drop handling
DO $$
BEGIN
    -- Check if it's a table and drop
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'alkhayr_requests') THEN
        EXECUTE 'DROP TABLE IF EXISTS alkhayr_requests CASCADE';
    END IF;

    -- Check if it's a view and drop
    IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'alkhayr_requests') THEN
        EXECUTE 'DROP VIEW IF EXISTS alkhayr_requests CASCADE';
    END IF;
END $$;
-- Create the view with origin
CREATE OR REPLACE VIEW alkhayr_requests AS
SELECT 
    l.id,
    l.full_name as requester_name,
    l.medicine_name as description,
    l.classification,
    'DZD' as currency,
    l.afford_amount as amount,
    l.status,
    l.created_at,
    l.created_at as accepted_at,
    'local' as origin,
    'local_medicine_requests' as table_name
    'local_medicine_requests' as table_name
FROM local_medicine_requests l

UNION ALL

SELECT 
    f.id,
    f.full_name as requester_name,
    f.medicine_details as description,
    f.classification,
    'EUR' as currency,
    f.budget as amount,
    f.status,
    f.created_at,
    f.created_at as accepted_at,
    'foreign' as origin,
    'foreign_medicine_requests' as table_name
FROM foreign_medicine_requests f;
