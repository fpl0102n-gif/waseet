-- Trigger to send email when a Material Donation is Approved
-- This trigger listens for updates to the 'material_donations' table.
-- It fires ONLY when the status changes to 'approved'.

-- 1. Drop existing trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS on_material_donation_update_email ON public.material_donations;

-- 2. Create the trigger
CREATE TRIGGER on_material_donation_update_email
  AFTER UPDATE ON public.material_donations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'approved')
  EXECUTE FUNCTION public.handle_new_email('material_donation_approved');
