-- Prevent self-referrals from generating earnings
-- Replaces previous update_referral_earnings_on_status logic to skip when the order contact matches the referral owner_contact

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
    IF (TG_OP = 'UPDATE' AND OLD.status != 'done' AND NEW.status = 'done') OR 
       (TG_OP = 'INSERT' AND NEW.status = 'done') THEN

      SELECT * INTO ref_record FROM referral_codes WHERE code = NEW.referral_code;

      IF FOUND THEN
        -- Prevent self-referral: if the order contact matches the referral owner_contact (case-insensitive)
        IF lower(ref_record.owner_contact) = lower(NEW.contact_value) THEN
          RETURN NEW; -- Skip any earnings update
        END IF;

        new_total := ref_record.total_collected + NEW.total;
        old_milestone := floor(ref_record.total_collected / 200);
        new_milestone := floor(new_total / 200);
        milestone_diff := new_milestone - old_milestone;

        IF milestone_diff > 0 THEN
          earnings_to_add := milestone_diff * 1000; -- each milestone gives 1000 DA
          UPDATE referral_codes
          SET 
            total_collected = new_total,
            rewards_granted = rewards_granted + milestone_diff,
            total_earnings_da = total_earnings_da + earnings_to_add,
            updated_at = now()
          WHERE code = NEW.referral_code;
        ELSE
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
