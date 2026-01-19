-- Migration: Complete Exchange Rates System
-- Admin-managed currency exchange rates with buy/sell rates

-- Drop old tables if exists and recreate with new structure
DROP TABLE IF EXISTS exchange_matches CASCADE;
DROP TABLE IF EXISTS exchange_requests CASCADE;
DROP TABLE IF EXISTS exchange_rates CASCADE;
DROP TABLE IF EXISTS exchange_settings CASCADE;

-- Table: exchange_rates
-- Stores exchange rates between currency pairs (admin-managed)
CREATE TABLE exchange_rates (
  id SERIAL PRIMARY KEY,
  currency_from VARCHAR(10) NOT NULL,
  currency_to VARCHAR(10) NOT NULL,
  buy_rate DECIMAL(15, 6) NOT NULL,  -- Rate when user BUYS currency_to
  sell_rate DECIMAL(15, 6) NOT NULL, -- Rate when user SELLS currency_to
  is_active BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(currency_from, currency_to)
);

-- Table: exchange_payment_methods
-- Admin-managed list of available payment methods
CREATE TABLE exchange_payment_methods (
  id SERIAL PRIMARY KEY,
  method_name VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: exchange_requests
-- User requests for currency exchange
CREATE TABLE exchange_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  request_type VARCHAR(10) NOT NULL CHECK (request_type IN ('buy', 'sell')),
  
  -- Currency pair
  currency_from VARCHAR(10) NOT NULL,
  currency_to VARCHAR(10) NOT NULL,
  
  -- Amounts
  amount DECIMAL(15, 2) NOT NULL, -- Quantity user wants to exchange
  rate DECIMAL(15, 6) NOT NULL,   -- Rate at time of request
  total_price DECIMAL(15, 2) NOT NULL, -- Calculated price
  
  -- Payment method
  payment_method VARCHAR(100),
  
  -- Location & Contact
  country VARCHAR(100),
  city VARCHAR(100),
  contact_method VARCHAR(50),
  contact_value VARCHAR(255),
  
  -- Additional info
  notes TEXT,
  attachments TEXT[],
  
  -- Status workflow
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'paired', 'completed', 'rejected', 'cancelled')),
  
  -- Admin actions
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: exchange_matches
-- Admin pairs buy/sell requests
CREATE TABLE exchange_matches (
  id SERIAL PRIMARY KEY,
  buy_request_id INTEGER REFERENCES exchange_requests(id) ON DELETE CASCADE,
  sell_request_id INTEGER REFERENCES exchange_requests(id) ON DELETE CASCADE,
  matched_by UUID REFERENCES auth.users(id),
  matched_at TIMESTAMPTZ DEFAULT now(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default currency rates (admin can update these)
INSERT INTO exchange_rates (currency_from, currency_to, buy_rate, sell_rate) VALUES
  ('USD', 'DZD', 135.50, 133.50),
  ('EUR', 'DZD', 145.00, 143.00),
  ('GBP', 'DZD', 170.00, 168.00),
  ('DZD', 'USD', 0.00738, 0.00748),
  ('DZD', 'EUR', 0.00689, 0.00699),
  ('DZD', 'GBP', 0.00588, 0.00595);

-- Insert default payment methods
INSERT INTO exchange_payment_methods (method_name, display_order) VALUES
  ('Cash', 1),
  ('CCP', 2),
  ('Baridi Mob', 3),
  ('Virement bancaire', 4),
  ('Wise', 5),
  ('PayPal', 6),
  ('Crypto', 7);

-- RLS Policies
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_matches ENABLE ROW LEVEL SECURITY;

-- Public can view active rates
CREATE POLICY "Anyone can view active rates"
  ON exchange_rates FOR SELECT
  USING (is_active = true);

-- Public can view active payment methods
CREATE POLICY "Anyone can view active payment methods"
  ON exchange_payment_methods FOR SELECT
  USING (is_active = true);

-- Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON exchange_requests FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can create requests
CREATE POLICY "Users can create requests"
  ON exchange_requests FOR INSERT
  WITH CHECK (true);

-- Users can update their own pending requests
CREATE POLICY "Users can update own pending requests"
  ON exchange_requests FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Admins have full access (check user_roles table)
CREATE POLICY "Admins have full access to rates"
  ON exchange_rates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins have full access to payment methods"
  ON exchange_payment_methods FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all requests"
  ON exchange_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all requests"
  ON exchange_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all matches"
  ON exchange_matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage matches"
  ON exchange_matches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(currency_from, currency_to);
CREATE INDEX idx_exchange_requests_status ON exchange_requests(status);
CREATE INDEX idx_exchange_requests_user ON exchange_requests(user_id);
CREATE INDEX idx_exchange_matches_requests ON exchange_matches(buy_request_id, sell_request_id);

-- Comments
COMMENT ON TABLE exchange_rates IS 'Admin-managed exchange rates between currency pairs';
COMMENT ON TABLE exchange_payment_methods IS 'Admin-managed list of payment methods';
COMMENT ON TABLE exchange_requests IS 'User currency exchange requests with calculated prices';
COMMENT ON TABLE exchange_matches IS 'Admin-created matches between buy and sell requests';
