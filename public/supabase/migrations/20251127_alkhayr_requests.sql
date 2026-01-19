-- AlKhayr Requests table and policies
CREATE TABLE IF NOT EXISTS alkayhr_requests (
  id SERIAL PRIMARY KEY,
  requester_name TEXT,
  contact_method TEXT CHECK (contact_method IN ('whatsapp','telegram','email','phone')) DEFAULT 'whatsapp',
  contact_value TEXT NOT NULL,
  description TEXT NOT NULL,
  currency TEXT CHECK (currency IN ('USD','EUR','DZD')) DEFAULT 'USD',
  amount NUMERIC(15,2),
  classification TEXT NOT NULL CHECK (classification IN ('severe','medium','normal')) DEFAULT 'normal',
  status TEXT NOT NULL CHECK (status IN ('pending','accepted','rejected')) DEFAULT 'pending',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id)
);

ALTER TABLE alkayhr_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public form) - optional tighten later
CREATE POLICY "Anyone can create alkayhr request"
 ON alkayhr_requests FOR INSERT WITH CHECK (true);

-- Owner or admin can view
CREATE POLICY "Owner or admin view alkayhr"
 ON alkayhr_requests FOR SELECT USING (
   (user_id IS NOT NULL AND auth.uid() = user_id) OR
   EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
 );

-- Owner can update while pending
CREATE POLICY "Owner update pending alkayhr"
 ON alkayhr_requests FOR UPDATE USING (auth.uid() = user_id AND status = 'pending')
 WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Admin manage all
CREATE POLICY "Admin manage alkayhr"
 ON alkayhr_requests FOR ALL USING (
   EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
 ) WITH CHECK (
   EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
 );

CREATE OR REPLACE FUNCTION set_alkayhr_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted' THEN
    NEW.accepted_at = now();
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_alkayhr_requests_updated_at
BEFORE UPDATE ON alkayhr_requests
FOR EACH ROW EXECUTE FUNCTION set_alkayhr_requests_updated_at();
