-- Create blood donors table
CREATE TABLE IF NOT EXISTS blood_donors (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 65),
  blood_type TEXT NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  last_donation_date DATE,
  wilaya TEXT NOT NULL,
  city TEXT NOT NULL,
  medical_conditions TEXT,
  willing_to_be_contacted BOOLEAN DEFAULT true,
  can_share_info BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  urgent_availability BOOLEAN DEFAULT false,
  contact_app TEXT CHECK (contact_app IN ('whatsapp', 'telegram', 'aucun')) DEFAULT 'aucun',
  whatsapp_number TEXT,
  telegram_username TEXT,
  approved_by_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_blood_donors_blood_type ON blood_donors(blood_type);
CREATE INDEX idx_blood_donors_wilaya ON blood_donors(wilaya);
CREATE INDEX idx_blood_donors_phone ON blood_donors(phone_number);
CREATE INDEX idx_blood_donors_active ON blood_donors(is_active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blood_donors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER blood_donors_updated_at
  BEFORE UPDATE ON blood_donors
  FOR EACH ROW
  EXECUTE FUNCTION update_blood_donors_updated_at();

-- Enable Row Level Security
ALTER TABLE blood_donors ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active donors who agreed to share info AND approved by admin
CREATE POLICY "Anyone can view approved active donors"
  ON blood_donors FOR SELECT
  USING (is_active = true AND can_share_info = true AND approved_by_admin = true);

-- Policy: Users can insert their own donor registration
CREATE POLICY "Anyone can register as donor"
  ON blood_donors FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own record (by phone number)
CREATE POLICY "Donors can update own record"
  ON blood_donors FOR UPDATE
  USING (true);

-- Create blood donation requests table (for urgent cases)
CREATE TABLE IF NOT EXISTS blood_donation_requests (
  id BIGSERIAL PRIMARY KEY,
  requester_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  blood_type_needed TEXT NOT NULL CHECK (blood_type_needed IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  wilaya TEXT NOT NULL,
  city TEXT NOT NULL,
  hospital_name TEXT,
  urgency_level TEXT DEFAULT 'normal' CHECK (urgency_level IN ('urgent', 'very_urgent', 'normal')),
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ
);

-- Add index for active requests
CREATE INDEX idx_blood_requests_status ON blood_donation_requests(status);
CREATE INDEX idx_blood_requests_blood_type ON blood_donation_requests(blood_type_needed);
CREATE INDEX idx_blood_requests_wilaya ON blood_donation_requests(wilaya);

-- Enable RLS
ALTER TABLE blood_donation_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active requests
CREATE POLICY "Anyone can view active requests"
  ON blood_donation_requests FOR SELECT
  USING (status = 'active');

-- Policy: Anyone can create request
CREATE POLICY "Anyone can create request"
  ON blood_donation_requests FOR INSERT
  WITH CHECK (true);

-- Comment on tables
COMMENT ON TABLE blood_donors IS 'Blood donors registration and information';
COMMENT ON TABLE blood_donation_requests IS 'Blood donation urgent requests';
