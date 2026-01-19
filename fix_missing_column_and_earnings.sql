-- 1. Add the missing exchange_rate column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS exchange_rate numeric DEFAULT 135;

-- 2. Update referral earnings calculation to convert DZD total back to USD
CREATE OR REPLACE FUNCTION update_referral_earnings_on_status()
RETURNS TRIGGER AS $$
DECLARE
  ref_record RECORD;
  new_total_collected numeric;
  old_milestone integer;
  new_milestone integer;
  milestone_diff integer;
  earnings_to_add numeric;
  order_usd_value numeric;
  rate numeric;
BEGIN
  -- Only process if referral_code is provided and status changed to 'done'
  IF NEW.referral_code IS NOT NULL AND NEW.referral_code != '' THEN
    -- Check if this is a status change to 'done' or if it's a new order with 'done' status
    IF (TG_OP = 'UPDATE' AND OLD.status != 'done' AND NEW.status = 'done') OR 
       (TG_OP = 'INSERT' AND NEW.status = 'done') THEN
      
      -- Get current referral code record
      SELECT * INTO ref_record 
      FROM referral_codes 
      WHERE code = NEW.referral_code;
      
      IF FOUND THEN
        -- Get exchange rate (use stored rate or default if null/zero)
        rate := COALESCE(NEW.exchange_rate, 135);
        if rate = 0 THEN rate := 135; END IF;

        -- Calculate Order Value in USD
        order_usd_value := NEW.total / rate;

        -- Calculate new total (accumulate USD value)
        new_total_collected := ref_record.total_collected + order_usd_value;
        
        -- Calculate how many $200 milestones were completed before
        old_milestone := floor(ref_record.total_collected / 200);
        
        -- Calculate how many $200 milestones are completed now
        new_milestone := floor(new_total_collected / 200);
        
        -- Calculate the difference (new rewards earned)
        milestone_diff := new_milestone - old_milestone;
        
        IF milestone_diff > 0 THEN
          -- Each milestone = 1000 DA
          earnings_to_add := milestone_diff * 1000;
          
          -- Update referral code record
          UPDATE referral_codes
          SET 
            total_collected = new_total_collected,
            rewards_granted = rewards_granted + milestone_diff,
            total_earnings_da = total_earnings_da + earnings_to_add,
            updated_at = now()
          WHERE code = NEW.referral_code;
        ELSE
          -- Just update the total collected
          UPDATE referral_codes
          SET 
            total_collected = new_total_collected,
            updated_at = now()
          WHERE code = NEW.referral_code;
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Reload schema cache (optional, sometimes helps)
NOTIFY pgrst, 'reload schema';
