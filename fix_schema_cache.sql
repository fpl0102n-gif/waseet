-- Force PostgREST to reload the schema cache
-- This fixes errors like "Could not find column ... in the schema cache"

NOTIFY pgrst, 'reload schema';
