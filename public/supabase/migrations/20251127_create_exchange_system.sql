-- Exchange System Migration
-- Creates tables for currency exchange requests and matches

-- Exchange Requests Table
CREATE TABLE IF NOT EXISTS exchange_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('buy', 'sell')),
  currency TEXT NOT NULL,
  amount_min DECIMAL(15, 2),
  amount_max DECIMAL(15, 2),
  amount_exact DECIMAL(15, 2),
  price DECIMAL(15, 4),
  payment_methods JSONB DEFAULT '[]'::jsonb,
  country TEXT,
  city TEXT,
  contact_method TEXT NOT NULL CHECK (contact_method IN ('whatsapp', 'telegram', 'email', 'phone')),
  contact_value TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'paired', 'completed', 'rejected', 'disputed')),
  rejection_reason TEXT,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exchange Matches Table
CREATE TABLE IF NOT EXISTS exchange_matches (
  id BIGSERIAL PRIMARY KEY,
  buy_request_id BIGINT NOT NULL REFERENCES exchange_requests(id) ON DELETE CASCADE,
  sell_request_id BIGINT NOT NULL REFERENCES exchange_requests(id) ON DELETE CASCADE,
  matched_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled', 'disputed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exchange Settings Table (for admin configuration)
CREATE TABLE IF NOT EXISTS exchange_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_exchange_requests_user_id ON exchange_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_type ON exchange_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_status ON exchange_requests(status);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_currency ON exchange_requests(currency);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_country ON exchange_requests(country);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_created_at ON exchange_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_exchange_matches_buy_request ON exchange_matches(buy_request_id);
CREATE INDEX IF NOT EXISTS idx_exchange_matches_sell_request ON exchange_matches(sell_request_id);
CREATE INDEX IF NOT EXISTS idx_exchange_matches_status ON exchange_matches(status);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_exchange_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER exchange_requests_updated_at
  BEFORE UPDATE ON exchange_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_exchange_updated_at();

CREATE TRIGGER exchange_matches_updated_at
  BEFORE UPDATE ON exchange_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_exchange_updated_at();

-- Row Level Security (RLS)
ALTER TABLE exchange_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exchange_requests

-- Users can insert their own requests (or anonymous requests)
CREATE POLICY "Users can create exchange requests"
  ON exchange_requests
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own requests
CREATE POLICY "Users can view their own requests"
  ON exchange_requests
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Users can update their own pending requests
CREATE POLICY "Users can update their own pending requests"
  ON exchange_requests
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all exchange requests"
  ON exchange_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Admins can update any request
CREATE POLICY "Admins can update exchange requests"
  ON exchange_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for exchange_matches

-- Users can view matches involving their requests
CREATE POLICY "Users can view their matches"
  ON exchange_matches
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM exchange_requests
      WHERE (exchange_requests.id = exchange_matches.buy_request_id 
             OR exchange_requests.id = exchange_matches.sell_request_id)
      AND exchange_requests.user_id = auth.uid()
    )
  );

-- Admins can view all matches
CREATE POLICY "Admins can view all matches"
  ON exchange_matches
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Admins can create matches
CREATE POLICY "Admins can create matches"
  ON exchange_matches
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Admins can update matches
CREATE POLICY "Admins can update matches"
  ON exchange_matches
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for exchange_settings (admin only)
CREATE POLICY "Admins can manage exchange settings"
  ON exchange_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Insert default settings
INSERT INTO exchange_settings (key, value) VALUES
  ('auto_match_enabled', 'false'),
  ('kyc_threshold_amount', '10000'),
  ('price_tolerance_percent', '5')
ON CONFLICT (key) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE exchange_requests IS 'Stores buy and sell currency exchange requests';
COMMENT ON TABLE exchange_matches IS 'Stores matched buy-sell pairs created by admin';
COMMENT ON TABLE exchange_settings IS 'Configuration settings for exchange feature';
