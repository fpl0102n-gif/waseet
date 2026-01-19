-- Drop restrictive check constraints that might conflict with the ID logic
-- or limit the status values beyond the Enum definition.

ALTER TABLE public.local_medicine_requests 
DROP CONSTRAINT IF EXISTS local_medicine_requests_status_check;

ALTER TABLE public.foreign_medicine_requests 
DROP CONSTRAINT IF EXISTS foreign_medicine_requests_status_check;

ALTER TABLE public.diaspora_volunteers
DROP CONSTRAINT IF EXISTS diaspora_volunteers_status_check;

-- Optional: Verify Status Enum values
-- (This just comments on what they are for reference)
-- ENUM: 'pending', 'reviewing', 'matched', 'in_progress', 'completed', 'cancelled'

NOTIFY pgrst, 'reload schema';
