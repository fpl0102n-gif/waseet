-- FIX TRANSPORT EMAIL TRIGGER

-- 1. Ensure Email Column Exists
ALTER TABLE public.transport_volunteers 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Drop and Recreate the Trigger explicitly
DROP TRIGGER IF EXISTS on_transport_volunteer_email ON public.transport_volunteers;

CREATE TRIGGER on_transport_volunteer_email
  AFTER INSERT ON public.transport_volunteers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_email('transport_volunteer');

-- 3. Grant Permissions (Just in case)
GRANT ALL ON TABLE public.transport_volunteers TO postgres, authenticated, service_role;
