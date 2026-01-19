-- Drop the default validation/type constraint if it exists
DO $$ 
BEGIN
    -- Try to convert the column to text. 
    -- If it's an enum, we cast it to text.
    ALTER TABLE diaspora_volunteers 
    ALTER COLUMN contact_type TYPE text USING contact_type::text;
    
    -- Drop the enum type if it's no longer used (optional, but cleaner)
    -- DROP TYPE IF EXISTS contact_type;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- Ensure it is text
ALTER TABLE diaspora_volunteers 
ALTER COLUMN contact_type TYPE text;
