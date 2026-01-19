SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'medicine_requests';

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'medicine-images';
