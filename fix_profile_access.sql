CREATE OR REPLACE FUNCTION get_donor_by_phone(phone text)
RETURNS SETOF blood_donors
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM blood_donors
  WHERE phone_number = phone;
END;
$$;

GRANT EXECUTE ON FUNCTION get_donor_by_phone(text) TO postgres, anon, authenticated, service_role;
