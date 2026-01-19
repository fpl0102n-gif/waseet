-- Block self-referrals at insert/update time by rejecting the order
-- This complements the earnings trigger and gives a definitive constraint

CREATE OR REPLACE FUNCTION prevent_self_referral_order()
RETURNS TRIGGER AS $$
DECLARE
  ref RECORD;
  v_owner text;
  v_order text;
BEGIN
  IF COALESCE(NEW.referral_code, '') = '' THEN
    RETURN NEW;
  END IF;

  SELECT owner_contact, contact_type
  INTO ref
  FROM referral_codes
  WHERE code = NEW.referral_code
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Compare only when contact types match (cast both to text)
  IF ref.contact_type::text = NEW.contact_type::text THEN
    IF NEW.contact_type::text = 'whatsapp' THEN
      -- Normalize phone: strip spaces/dashes/parentheses and lowercase
      v_owner := lower(regexp_replace(ref.owner_contact, '[\s\-\(\)]', '', 'g'));
      v_order := lower(regexp_replace(NEW.contact_value, '[\s\-\(\)]', '', 'g'));
    ELSE
      -- Telegram: compare lowercase
      v_owner := lower(ref.owner_contact);
      v_order := lower(NEW.contact_value);
    END IF;

    IF v_owner = v_order THEN
      RAISE EXCEPTION 'Self-referral is not allowed' USING HINT = 'self_referral';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply BEFORE INSERT and BEFORE UPDATE (if referral_code can be changed)
DROP TRIGGER IF EXISTS trg_prevent_self_referral_insert ON public.orders;
CREATE TRIGGER trg_prevent_self_referral_insert
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION prevent_self_referral_order();

DROP TRIGGER IF EXISTS trg_prevent_self_referral_update ON public.orders;
CREATE TRIGGER trg_prevent_self_referral_update
BEFORE UPDATE OF referral_code, contact_type, contact_value ON public.orders
FOR EACH ROW
EXECUTE FUNCTION prevent_self_referral_order();
