-- ============================================
-- COMPLETE EXCHANGE SYSTEM SETUP
-- Copy this entire file and paste in Supabase SQL Editor
-- No CLI or network connection needed
-- ============================================

-- Step 1: Drop existing tables if any
DROP TABLE IF EXISTS exchange_matches CASCADE;
DROP TABLE IF EXISTS exchange_requests CASCADE;
DROP TABLE IF EXISTS exchange_rates CASCADE;
DROP TABLE IF EXISTS exchange_payment_methods CASCADE;
DROP TABLE IF EXISTS exchange_settings CASCADE;

-- Step 2: Create exchange_rates table
CREATE TABLE exchange_rates (
  id SERIAL PRIMARY KEY,
  currency_from VARCHAR(10) NOT NULL,
  currency_to VARCHAR(10) NOT NULL,
  buy_rate DECIMAL(15, 6) NOT NULL,
  sell_rate DECIMAL(15, 6) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(currency_from, currency_to)
);

-- Step 3: Create exchange_payment_methods table
CREATE TABLE exchange_payment_methods (
  id SERIAL PRIMARY KEY,
  method_name VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Step 4: Create exchange_requests table
CREATE TABLE exchange_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  request_type VARCHAR(10) NOT NULL CHECK (request_type IN ('buy', 'sell')),
  currency_from VARCHAR(10) NOT NULL,
  currency_to VARCHAR(10) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  rate DECIMAL(15, 6) NOT NULL,
  total_price DECIMAL(15, 2) NOT NULL,
  payment_method VARCHAR(100),
  country VARCHAR(100),
  city VARCHAR(100),
  contact_method VARCHAR(50),
  contact_value VARCHAR(255),
  notes TEXT,
  attachments TEXT[],
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'paired', 'completed', 'rejected', 'cancelled')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 5: Create exchange_matches table
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

-- Step 6: Insert exchange rates data
INSERT INTO exchange_rates (currency_from, currency_to, buy_rate, sell_rate, is_active) VALUES
  ('USD', 'DZD', 132.50, 134.00, true),
  ('EUR', 'DZD', 145.00, 147.50, true),
  ('GBP', 'DZD', 168.00, 170.50, true),
  ('CAD', 'DZD', 95.00, 97.00, true),
  ('TRY', 'DZD', 4.20, 4.50, true),
  ('DZD', 'USD', 0.00738, 0.00748, true),
  ('DZD', 'EUR', 0.00689, 0.00699, true),
  ('DZD', 'GBP', 0.00588, 0.00595, true);

-- Step 7: Insert payment methods
INSERT INTO exchange_payment_methods (method_name, is_active, display_order) VALUES
  ('Cash / Espèces', true, 1),
  ('CCP', true, 2),
  ('Baridi Mob', true, 3),
  ('Bank Transfer / Virement', true, 4),
  ('Western Union', true, 5),
  ('MoneyGram', true, 6),
  ('Wise', true, 7),
  ('PayPal', true, 8);

-- Step 8: Enable RLS
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_matches ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS Policies
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

-- Admins have full access to rates
CREATE POLICY "Admins have full access to rates"
  ON exchange_rates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins have full access to payment methods
CREATE POLICY "Admins have full access to payment methods"
  ON exchange_payment_methods FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can view all requests
CREATE POLICY "Admins can view all requests"
  ON exchange_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all requests
CREATE POLICY "Admins can update all requests"
  ON exchange_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can view all matches
CREATE POLICY "Admins can view all matches"
  ON exchange_matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage matches
CREATE POLICY "Admins can manage matches"
  ON exchange_matches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Step 10: Create indexes
CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(currency_from, currency_to);
CREATE INDEX idx_exchange_requests_status ON exchange_requests(status);
CREATE INDEX idx_exchange_requests_user ON exchange_requests(user_id);
CREATE INDEX idx_exchange_matches_requests ON exchange_matches(buy_request_id, sell_request_id);

-- Step 11: Verify installation
SELECT 
  'Setup Complete!' as status,
  (SELECT COUNT(*) FROM exchange_rates WHERE is_active = true) as active_rates,
  (SELECT COUNT(*) FROM exchange_payment_methods WHERE is_active = true) as payment_methods;
