-- Trigger for Material Donation Rejection
-- Fires when status changes to 'rejected'

DROP TRIGGER IF EXISTS on_material_donation_rejected_email ON public.material_donations;

CREATE TRIGGER on_material_donation_rejected_email
  AFTER UPDATE ON public.material_donations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'rejected')
  EXECUTE FUNCTION public.handle_new_email('material_donation_rejected');
