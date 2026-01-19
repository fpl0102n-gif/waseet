-- Rename mistaken table name alkayhr_requests -> alkhayr_requests
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'alkayhr_requests'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'alkhayr_requests'
  ) THEN
    ALTER TABLE alkayhr_requests RENAME TO alkhayr_requests;
  END IF;
END $$;
