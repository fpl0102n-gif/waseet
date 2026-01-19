-- Agent Registrations schema
DROP TABLE IF EXISTS agent_registration_logs CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS agent_registrations CASCADE;

CREATE TABLE agent_registrations (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  business_name TEXT,
  email TEXT NOT NULL,
  phone_whatsapp TEXT NOT NULL,
  country TEXT,
  city TEXT,
  shipping_methods TEXT[],
  goods_types TEXT[],
  max_value NUMERIC(15,2),
  max_weight TEXT,
  max_volume TEXT,
  commission_preference TEXT, -- free text: e.g., 5% or 20 USD
  lead_time TEXT,
  languages TEXT[],
  proof_attachments TEXT[], -- storage paths
  references_links TEXT[],
  payment_details_encrypted TEXT,
  agree_terms BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  email_token TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','active','rejected')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  registration_id INTEGER REFERENCES agent_registrations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  business_name TEXT,
  email TEXT NOT NULL,
  phone_whatsapp TEXT NOT NULL,
  country TEXT,
  city TEXT,
  shipping_methods TEXT[],
  goods_types TEXT[],
  max_value NUMERIC(15,2),
  commission_final TEXT,
  lead_time TEXT,
  languages TEXT[],
  payment_details_encrypted TEXT,
  preferred BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE agent_registration_logs (
  id SERIAL PRIMARY KEY,
  registration_id INTEGER NOT NULL REFERENCES agent_registrations(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- submitted|verified|activated|rejected|requested_info
  details JSONB,
  actor UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_agent_registrations_status ON agent_registrations(status);
CREATE INDEX idx_agent_registrations_country ON agent_registrations(country);
CREATE INDEX idx_agent_registrations_date ON agent_registrations(created_at);

-- RLS
ALTER TABLE agent_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_registration_logs ENABLE ROW LEVEL SECURITY;

-- Policies: anyone can create registration
CREATE POLICY "Anyone can create agent registration"
  ON agent_registrations FOR INSERT
  WITH CHECK (true);

-- Owner (if logged) can view own; admin can view all
CREATE POLICY "Owner or admin view registration"
  ON agent_registrations FOR SELECT
  USING ((user_id IS NOT NULL AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Owner can update while pending
CREATE POLICY "Owner update pending registration"
  ON agent_registrations FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Admin can update all
CREATE POLICY "Admin manage registrations"
  ON agent_registrations FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Agents: admin-only
CREATE POLICY "Admin manage agents"
  ON agents FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Logs: admin view/insert
CREATE POLICY "Admin manage agent logs"
  ON agent_registration_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Triggers
CREATE OR REPLACE FUNCTION set_updated_at_agent_reg()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_agent_registrations_updated
BEFORE UPDATE ON agent_registrations
FOR EACH ROW EXECUTE FUNCTION set_updated_at_agent_reg();
