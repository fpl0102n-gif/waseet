-- Import Requests schema and policies
-- Drop if re-running during development
DROP TABLE IF EXISTS import_request_logs CASCADE;
DROP TABLE IF EXISTS import_requests CASCADE;
DROP TABLE IF EXISTS import_settings CASCADE;

-- Settings for commission
CREATE TABLE import_settings (
  id SERIAL PRIMARY KEY,
  commission_mode TEXT NOT NULL CHECK (commission_mode IN ('percentage','fixed','fixed_plus_percentage')) DEFAULT 'percentage',
  commission_percentage NUMERIC(5,2) DEFAULT 5.00,
  commission_fixed NUMERIC(15,2) DEFAULT 0,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Main import requests table
CREATE TABLE import_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  customer_name TEXT,
  contact_method TEXT CHECK (contact_method IN ('whatsapp','email','phone')) DEFAULT 'whatsapp',
  contact_value TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  origin_city TEXT,
  product_description TEXT NOT NULL,
  product_links TEXT[],
  product_currency VARCHAR(10) DEFAULT 'EUR',
  product_value NUMERIC(15,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  shipping_priority TEXT CHECK (shipping_priority IN ('normal','express')) DEFAULT 'normal',
  delivery_method TEXT CHECK (delivery_method IN ('home_delivery','pickup')) DEFAULT 'home_delivery',
  attachments TEXT[],
  terms_accepted BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending','verified','assigned','in_transit','arrived','delivered','completed','disputed','rejected'
  )),
  -- Agent assignment fields
  agent_name TEXT,
  agent_phone TEXT,
  agent_note TEXT,
  agent_fee NUMERIC(15,2),
  -- Calculations on completion
  calculated_commission NUMERIC(15,2),
  calculated_agent_fee NUMERIC(15,2),
  completed_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Action logs
CREATE TABLE import_request_logs (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES import_requests(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  actor UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_import_requests_status ON import_requests(status);
CREATE INDEX idx_import_requests_country ON import_requests(origin_country);
CREATE INDEX idx_import_requests_date ON import_requests(created_at);

-- RLS
ALTER TABLE import_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_request_logs ENABLE ROW LEVEL SECURITY;

-- Policies: Settings admin-only
CREATE POLICY "Admins manage import settings"
  ON import_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Policies: Requests
-- Insert: anyone (anonymous allowed) to create a request
CREATE POLICY "Anyone can create import request"
  ON import_requests FOR INSERT
  WITH CHECK (true);

-- Select: owner (if logged) or admin. If user_id is null, no public listing.
CREATE POLICY "Owner or admin can view request"
  ON import_requests FOR SELECT
  USING (
    (user_id IS NOT NULL AND auth.uid() = user_id) OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Update: owner can update while pending; admin can update anytime
CREATE POLICY "Owner can update pending"
  ON import_requests FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admin can update all import requests"
  ON import_requests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Logs: admin can view; owner can view their request logs
CREATE POLICY "Admin view logs"
  ON import_request_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Owner view own logs"
  ON import_request_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM import_requests r 
    WHERE r.id = import_request_logs.request_id 
      AND r.user_id IS NOT NULL AND r.user_id = auth.uid()
  ));

-- Admin can insert logs
CREATE POLICY "Admin manage logs"
  ON import_request_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_import_requests_updated_at
BEFORE UPDATE ON import_requests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Function to compute commission on completion
CREATE OR REPLACE FUNCTION compute_import_commission()
RETURNS TRIGGER AS $$
DECLARE
  mode TEXT;
  pct NUMERIC(5,2);
  fixed NUMERIC(15,2);
  base NUMERIC(15,2);
  commission NUMERIC(15,2);
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    SELECT commission_mode, commission_percentage, commission_fixed
      INTO mode, pct, fixed
    FROM import_settings
    ORDER BY id DESC
    LIMIT 1;

    IF mode IS NULL THEN
      mode := 'percentage'; pct := 5.00; fixed := 0;
    END IF;

    base := COALESCE(NEW.product_value,0) * COALESCE(NEW.quantity,1);

    IF mode = 'percentage' THEN
      commission := ROUND(base * (pct/100.0), 2);
    ELSIF mode = 'fixed' THEN
      commission := fixed;
    ELSE
      commission := ROUND(base * (pct/100.0), 2) + fixed;
    END IF;

    NEW.calculated_commission := commission;
    NEW.calculated_agent_fee := NEW.agent_fee;
    NEW.completed_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_import_requests_compute_commission
BEFORE UPDATE ON import_requests
FOR EACH ROW EXECUTE FUNCTION compute_import_commission();

-- Seed default settings
INSERT INTO import_settings (commission_mode, commission_percentage, commission_fixed)
VALUES ('percentage', 5.00, 0)
ON CONFLICT DO NOTHING;
