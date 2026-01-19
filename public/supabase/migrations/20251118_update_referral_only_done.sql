-- Modify referral system to only count completed orders (status = 'done')

-- Drop old trigger
DROP TRIGGER IF EXISTS trigger_update_referral_earnings ON public.orders;

-- Create new function that tracks status changes
CREATE OR REPLACE FUNCTION update_referral_earnings_on_status()
RETURNS TRIGGER AS $$
DECLARE
  ref_record RECORD;
  new_total numeric;
  old_milestone integer;
  new_milestone integer;
  milestone_diff integer;
  earnings_to_add numeric;
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger that works on both INSERT and UPDATE
CREATE TRIGGER trigger_update_referral_earnings_on_status
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_earnings_on_status();

-- Reset all referral earnings (since we're changing the rules)
UPDATE referral_codes 
SET total_collected = 0, 
    rewards_granted = 0, 
    total_earnings_da = 0;

-- Recalculate from existing 'done' orders
UPDATE referral_codes rc
SET
  total_collected = (
    SELECT COALESCE(SUM(total), 0)
    FROM orders
    WHERE referral_code = rc.code AND status = 'done'
  ),
  rewards_granted = (
    SELECT COALESCE(FLOOR(SUM(total) / 10000), 0)
    FROM orders
    WHERE referral_code = rc.code AND status = 'done'
  ),
  total_earnings_da = (
    SELECT COALESCE(FLOOR(SUM(total) / 10000) * 1000, 0)
    FROM orders
    WHERE referral_code = rc.code AND status = 'done'
  );
