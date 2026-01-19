-- Add approval system to Al-Khayr humanitarian platform
-- Requests and volunteers must be approved by admin before being active

-- Add approved column to local_medicine_requests (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'local_medicine_requests' 
                 AND column_name = 'approved') THEN
    ALTER TABLE public.local_medicine_requests
    ADD COLUMN approved BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN approved_at TIMESTAMPTZ,
    ADD COLUMN approved_by TEXT;
  END IF;
END $$;

-- Add approved column to foreign_medicine_requests (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'foreign_medicine_requests' 
                 AND column_name = 'approved') THEN
    ALTER TABLE public.foreign_medicine_requests
    ADD COLUMN approved BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN approved_at TIMESTAMPTZ,
    ADD COLUMN approved_by TEXT;
  END IF;
END $$;

-- Add approved column to diaspora_volunteers (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'diaspora_volunteers' 
                 AND column_name = 'approved') THEN
    ALTER TABLE public.diaspora_volunteers
    ADD COLUMN approved BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN approved_at TIMESTAMPTZ,
    ADD COLUMN approved_by TEXT;
  END IF;
END $$;

-- Create indexes for faster filtering (if not exists)
CREATE INDEX IF NOT EXISTS idx_local_medicine_approved ON public.local_medicine_requests(approved);
CREATE INDEX IF NOT EXISTS idx_foreign_medicine_approved ON public.foreign_medicine_requests(approved);
CREATE INDEX IF NOT EXISTS idx_diaspora_volunteers_approved ON public.diaspora_volunteers(approved);

-- Add comments
COMMENT ON COLUMN public.local_medicine_requests.approved IS 'Whether the request has been approved by admin';
COMMENT ON COLUMN public.foreign_medicine_requests.approved IS 'Whether the request has been approved by admin';
COMMENT ON COLUMN public.diaspora_volunteers.approved IS 'Whether the volunteer has been approved by admin';
