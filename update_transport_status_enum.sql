-- Update transport_volunteers status check constraint
ALTER TABLE public.transport_volunteers
DROP CONSTRAINT IF EXISTS transport_volunteers_status_check;

ALTER TABLE public.transport_volunteers
ADD CONSTRAINT transport_volunteers_status_check 
CHECK (status IN ('active', 'inactive', 'pending', 'rejected', 'deleted'));

-- Set default status to 'pending' for new registrations
ALTER TABLE public.transport_volunteers
ALTER COLUMN status SET DEFAULT 'pending';

-- Optional: Update existing 'inactive' to 'rejected' or keep as is?
-- We will keep 'inactive' as a valid state for manually disabled volunteers.
