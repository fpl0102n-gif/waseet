-- Create referral_codes table for tracking referral codes and earnings
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  owner_contact text NOT NULL,
  contact_type text NOT NULL CHECK (contact_type IN ('whatsapp', 'telegram')),
  total_collected numeric DEFAULT 0,
  rewards_granted integer DEFAULT 0,
  total_earnings_da numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can view referral codes (to validate when placing orders)
CREATE POLICY "Anyone can view referral codes"
  ON public.referral_codes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Anyone can insert referral codes (to generate new codes)
CREATE POLICY "Anyone can insert referral codes"
  ON public.referral_codes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can view all referral codes
CREATE POLICY "Admins can view all referral codes"
  ON public.referral_codes
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admins can update referral codes
CREATE POLICY "Admins can update referral codes"
  ON public.referral_codes
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create index for faster code lookups
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);

-- Add referral_code column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS referral_code text;

-- Create index for referral code lookups on orders
CREATE INDEX IF NOT EXISTS idx_orders_referral_code ON public.orders(referral_code);

-- Function to generate unique referral code (8 characters alphanumeric)
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  characters text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Removed confusing chars like 0,O,1,I
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(characters, floor(random() * length(characters) + 1)::integer, 1);
  END LOOP;
  
  -- Check if code exists, regenerate if it does
  WHILE EXISTS (SELECT 1 FROM referral_codes WHERE code = result) LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || substr(characters, floor(random() * length(characters) + 1)::integer, 1);
    END LOOP;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Function to update referral earnings when an order is placed
CREATE OR REPLACE FUNCTION update_referral_earnings()
RETURNS TRIGGER AS $$
DECLARE
  ref_record RECORD;
  new_total numeric;
  old_milestone integer;
  new_milestone integer;
  milestone_diff integer;
  earnings_to_add numeric;
BEGIN
  -- Only process if referral_code is provided
  IF NEW.referral_code IS NOT NULL AND NEW.referral_code != '' THEN
    -- Get current referral code record
    SELECT * INTO ref_record 
    FROM referral_codes 
    WHERE code = NEW.referral_code;
    
    IF FOUND THEN
      -- Calculate new total
      new_total := ref_record.total_collected + NEW.total;
      
      -- Calculate how many $200 milestones were completed before
      old_milestone := floor(ref_record.total_collected / 200);
      
      -- Calculate how many $200 milestones are completed now
      new_milestone := floor(new_total / 200);
      
      -- Calculate the difference (new rewards earned)
      milestone_diff := new_milestone - old_milestone;
      
      IF milestone_diff > 0 THEN
        -- Each milestone = 1000 DA
        earnings_to_add := milestone_diff * 1000;
        
        -- Update referral code record
        UPDATE referral_codes
        SET 
          total_collected = new_total,
          rewards_granted = rewards_granted + milestone_diff,
          total_earnings_da = total_earnings_da + earnings_to_add,
          updated_at = now()
        WHERE code = NEW.referral_code;
      ELSE
        -- Just update the total collected
        UPDATE referral_codes
        SET 
          total_collected = new_total,
          updated_at = now()
        WHERE code = NEW.referral_code;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update referral earnings when orders are inserted
DROP TRIGGER IF EXISTS trigger_update_referral_earnings ON public.orders;
CREATE TRIGGER trigger_update_referral_earnings
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_earnings();
