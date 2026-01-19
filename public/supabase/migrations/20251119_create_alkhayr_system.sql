-- Al-Khayr Humanitarian Medical Assistance System
-- Zero-Commission Medical Help Platform

-- Create enums
CREATE TYPE financial_ability AS ENUM ('can_pay', 'cannot_pay', 'partially');
CREATE TYPE delivery_type AS ENUM ('paid', 'free', 'no');
CREATE TYPE urgency_level AS ENUM ('urgent', 'normal');
CREATE TYPE request_status AS ENUM ('pending', 'reviewing', 'matched', 'in_progress', 'completed', 'cancelled');
CREATE TYPE need_type AS ENUM ('purchase_and_shipping', 'shipping_only');

-- Local Medicine Requests (medicine available in the country)
CREATE TABLE IF NOT EXISTS public.local_medicine_requests (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Patient Information
  full_name TEXT NOT NULL,
  city TEXT NOT NULL,
  contact_type contact_type NOT NULL,
  contact_value TEXT NOT NULL,
  
  -- Medicine Details
  medicine_name TEXT NOT NULL,
  prescription_url TEXT, -- URL to uploaded prescription (Supabase Storage)
  
  -- Financial Information
  financial_ability financial_ability NOT NULL,
  afford_amount DECIMAL(10, 2), -- Amount in DZD if can pay or partially
  
  -- Delivery
  need_delivery delivery_type NOT NULL,
  
  -- Priority
  urgency urgency_level NOT NULL DEFAULT 'normal',
  
  -- Additional
  notes TEXT,
  
  -- Status & Matching
  status request_status NOT NULL DEFAULT 'pending',
  matched_volunteer_id BIGINT, -- FK to diaspora_volunteers
  admin_notes TEXT,
  
  -- Indexes for search
  CONSTRAINT local_medicine_requests_contact_check CHECK (
    (contact_type = 'whatsapp' AND contact_value ~ '^\+[0-9]+$') OR
    (contact_type = 'telegram')
  )
);

-- Foreign Medicine Requests (medicine from abroad)
CREATE TABLE IF NOT EXISTS public.foreign_medicine_requests (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Patient Information
  full_name TEXT NOT NULL,
  city TEXT NOT NULL,
  contact_type contact_type NOT NULL,
  contact_value TEXT NOT NULL,
  
  -- Medicine Details
  medicine_details TEXT NOT NULL, -- Name, dosage, quantity
  prescription_url TEXT NOT NULL, -- Required for international orders
  expected_country TEXT, -- Expected source country
  
  -- Need Type
  need_type need_type NOT NULL,
  
  -- Financial Information
  financial_ability financial_ability NOT NULL,
  budget DECIMAL(10, 2), -- Approximate budget in USD if can pay or partially
  
  -- Priority
  urgency urgency_level NOT NULL DEFAULT 'normal',
  
  -- Additional
  notes TEXT,
  
  -- Status & Matching
  status request_status NOT NULL DEFAULT 'pending',
  matched_volunteer_id BIGINT, -- FK to diaspora_volunteers
  admin_notes TEXT,
  
  -- Indexes for search
  CONSTRAINT foreign_medicine_requests_contact_check CHECK (
    (contact_type = 'whatsapp' AND contact_value ~ '^\+[0-9]+$') OR
    (contact_type = 'telegram')
  )
);

-- Diaspora Volunteers (people abroad who can help)
CREATE TABLE IF NOT EXISTS public.diaspora_volunteers (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Volunteer Information
  full_name TEXT NOT NULL,
  current_country TEXT NOT NULL,
  city TEXT NOT NULL,
  contact_type contact_type NOT NULL,
  contact_value TEXT NOT NULL,
  
  -- Capabilities (stored as array)
  can_send_medicine BOOLEAN DEFAULT FALSE,
  can_buy_medicine BOOLEAN DEFAULT FALSE,
  can_ship_parcels BOOLEAN DEFAULT FALSE,
  can_provide_financial_support BOOLEAN DEFAULT FALSE,
  can_coordinate BOOLEAN DEFAULT FALSE,
  
  -- Financial Ability
  financial_ability financial_ability NOT NULL,
  max_amount DECIMAL(10, 2), -- Maximum amount in USD they can cover
  
  -- Additional Information
  extra_notes TEXT, -- Pharmacies, shipping contacts, etc.
  
  -- Notification Preferences
  notify_urgent_cases BOOLEAN DEFAULT TRUE,
  notify_funding_needed BOOLEAN DEFAULT TRUE,
  notify_import_requests BOOLEAN DEFAULT TRUE,
  
  -- Terms & Approval
  agreed_to_terms BOOLEAN NOT NULL DEFAULT FALSE,
  approved_by_admin BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  approved_by TEXT, -- Admin email or ID
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  CONSTRAINT diaspora_volunteers_contact_check CHECK (
    (contact_type = 'whatsapp' AND contact_value ~ '^\+[0-9]+$') OR
    (contact_type = 'telegram')
  ),
  CONSTRAINT diaspora_volunteers_terms_check CHECK (agreed_to_terms = TRUE)
);

-- Request Matches (tracking which volunteer is helping which request)
CREATE TABLE IF NOT EXISTS public.request_matches (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Request Information (one of these will be NULL)
  local_request_id BIGINT REFERENCES public.local_medicine_requests(id) ON DELETE CASCADE,
  foreign_request_id BIGINT REFERENCES public.foreign_medicine_requests(id) ON DELETE CASCADE,
  
  -- Volunteer
  volunteer_id BIGINT REFERENCES public.diaspora_volunteers(id) ON DELETE SET NULL,
  
  -- Match Details
  matched_by TEXT, -- Admin who made the match
  match_notes TEXT,
  
  -- Progress Tracking
  status request_status NOT NULL DEFAULT 'matched',
  completion_notes TEXT,
  completed_at TIMESTAMPTZ,
  
  -- Ensure only one request type is set
  CONSTRAINT request_matches_check CHECK (
    (local_request_id IS NOT NULL AND foreign_request_id IS NULL) OR
    (local_request_id IS NULL AND foreign_request_id IS NOT NULL)
  )
);

-- Add foreign key constraints for matched_volunteer_id
ALTER TABLE public.local_medicine_requests
ADD CONSTRAINT local_medicine_requests_matched_volunteer_fk
FOREIGN KEY (matched_volunteer_id) REFERENCES public.diaspora_volunteers(id) ON DELETE SET NULL;

ALTER TABLE public.foreign_medicine_requests
ADD CONSTRAINT foreign_medicine_requests_matched_volunteer_fk
FOREIGN KEY (matched_volunteer_id) REFERENCES public.diaspora_volunteers(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_local_requests_status ON public.local_medicine_requests(status);
CREATE INDEX idx_local_requests_urgency ON public.local_medicine_requests(urgency);
CREATE INDEX idx_local_requests_contact ON public.local_medicine_requests(contact_type, contact_value);
CREATE INDEX idx_local_requests_created ON public.local_medicine_requests(created_at DESC);

CREATE INDEX idx_foreign_requests_status ON public.foreign_medicine_requests(status);
CREATE INDEX idx_foreign_requests_urgency ON public.foreign_medicine_requests(urgency);
CREATE INDEX idx_foreign_requests_country ON public.foreign_medicine_requests(expected_country);
CREATE INDEX idx_foreign_requests_contact ON public.foreign_medicine_requests(contact_type, contact_value);
CREATE INDEX idx_foreign_requests_created ON public.foreign_medicine_requests(created_at DESC);

CREATE INDEX idx_volunteers_country ON public.diaspora_volunteers(current_country);
CREATE INDEX idx_volunteers_approved ON public.diaspora_volunteers(approved_by_admin);
CREATE INDEX idx_volunteers_active ON public.diaspora_volunteers(is_active);
CREATE INDEX idx_volunteers_contact ON public.diaspora_volunteers(contact_type, contact_value);

CREATE INDEX idx_matches_volunteer ON public.request_matches(volunteer_id);
CREATE INDEX idx_matches_local_request ON public.request_matches(local_request_id);
CREATE INDEX idx_matches_foreign_request ON public.request_matches(foreign_request_id);
CREATE INDEX idx_matches_status ON public.request_matches(status);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_local_medicine_requests_updated_at
BEFORE UPDATE ON public.local_medicine_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foreign_medicine_requests_updated_at
BEFORE UPDATE ON public.foreign_medicine_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diaspora_volunteers_updated_at
BEFORE UPDATE ON public.diaspora_volunteers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_request_matches_updated_at
BEFORE UPDATE ON public.request_matches
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.local_medicine_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foreign_medicine_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaspora_volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_matches ENABLE ROW LEVEL SECURITY;

-- Local Medicine Requests Policies
-- Anyone can insert (submit request)
CREATE POLICY "Anyone can submit local medicine requests"
ON public.local_medicine_requests FOR INSERT
TO public
WITH CHECK (true);

-- Users can view their own requests by contact
CREATE POLICY "Users can view their own local requests"
ON public.local_medicine_requests FOR SELECT
TO public
USING (true); -- We'll filter in the application layer by contact

-- Only service role can update/delete
CREATE POLICY "Only service role can update local requests"
ON public.local_medicine_requests FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Foreign Medicine Requests Policies
CREATE POLICY "Anyone can submit foreign medicine requests"
ON public.foreign_medicine_requests FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can view their own foreign requests"
ON public.foreign_medicine_requests FOR SELECT
TO public
USING (true);

CREATE POLICY "Only service role can update foreign requests"
ON public.foreign_medicine_requests FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Diaspora Volunteers Policies
CREATE POLICY "Anyone can register as volunteer"
ON public.diaspora_volunteers FOR INSERT
TO public
WITH CHECK (agreed_to_terms = true);

CREATE POLICY "Volunteers can view their own profile"
ON public.diaspora_volunteers FOR SELECT
TO public
USING (true);

CREATE POLICY "Only service role can approve volunteers"
ON public.diaspora_volunteers FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Request Matches Policies
CREATE POLICY "Only service role can manage matches"
ON public.request_matches FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view matches"
ON public.request_matches FOR SELECT
TO public
USING (true);

-- Comments
COMMENT ON TABLE public.local_medicine_requests IS 'Requests for medicine available locally in Algeria';
COMMENT ON TABLE public.foreign_medicine_requests IS 'Requests for medicine that needs to be imported from abroad';
COMMENT ON TABLE public.diaspora_volunteers IS 'Volunteers living abroad who can help with medicine purchase/shipping';
COMMENT ON TABLE public.request_matches IS 'Tracking which volunteer is helping which patient request';

COMMENT ON COLUMN public.local_medicine_requests.afford_amount IS 'Amount in DZD the patient can afford';
COMMENT ON COLUMN public.foreign_medicine_requests.budget IS 'Approximate budget in USD';
COMMENT ON COLUMN public.diaspora_volunteers.max_amount IS 'Maximum amount in USD the volunteer can cover';
