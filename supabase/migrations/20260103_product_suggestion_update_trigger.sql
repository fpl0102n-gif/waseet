-- Trigger for Product Suggestion Updates
-- Sends email when status changes

DROP TRIGGER IF EXISTS on_product_suggestion_update ON public.store_product_suggestions;

CREATE TRIGGER on_product_suggestion_update
  AFTER UPDATE ON public.store_product_suggestions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.handle_new_email('product_suggestion_update');
