-- FIX TEST DATA
-- The order #762100 has an invalid email "isla". We need a real email to test sending.

-- Update the JSON string in the notes column
UPDATE public.orders
SET notes = REPLACE(notes::text, '"user_email":"isla"', '"user_email":"admin@waseet.store"')
WHERE id = 762100;

-- Verify the change
SELECT id, notes FROM public.orders WHERE id = 762100;
