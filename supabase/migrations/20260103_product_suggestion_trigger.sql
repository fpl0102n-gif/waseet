-- Trigger for Product Suggestions
-- This ensures 'handle_new_email' is called with type='product_suggestion' whenever a new suggestion is inserted.

DROP TRIGGER IF EXISTS on_product_suggestion_created ON public.store_product_suggestions;

CREATE TRIGGER on_product_suggestion_created
  AFTER INSERT ON public.store_product_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_email('product_suggestion');
