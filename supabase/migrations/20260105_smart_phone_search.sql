-- Function to normalize phone numbers to the last 9 digits (Algerian Standard)
-- Removes all non-numeric characters, then takes the last 9.
CREATE OR REPLACE FUNCTION normalize_dz_phone(input_phone TEXT) 
RETURNS TEXT AS $$
DECLARE 
  clean_phone TEXT;
BEGIN
  clean_phone := REGEXP_REPLACE(input_phone, '\D', '', 'g');
  RETURN RIGHT(clean_phone, 9);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update get_donor_by_phone to use normalization
CREATE OR REPLACE FUNCTION get_donor_by_phone(phone text)
RETURNS SETOF blood_donors
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM blood_donors
  WHERE normalize_dz_phone(phone_number) = normalize_dz_phone(phone)
  LIMIT 1;
$$;
