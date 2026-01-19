-- 1. Create the unified table
CREATE TABLE IF NOT EXISTS public.medicine_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Request Type Classifier
    request_type TEXT NOT NULL CHECK (request_type IN ('local', 'foreign')),

    -- Common Fields
    full_name TEXT NOT NULL,
    city TEXT NOT NULL,
    wilaya TEXT,
    wilaya_id INTEGER,
    email TEXT,
    phone TEXT, -- contact_value
    contact_type TEXT, -- e.g. "phone, whatsapp"
    
    title TEXT,
    item_name TEXT, -- Merges medicine_name (local) and medicine_details (foreign)
    category TEXT DEFAULT 'humanitarian',
    
    prescription_url TEXT,
    financial_ability TEXT, -- can_pay, cannot_pay, partially
    urgency TEXT DEFAULT 'normal',
    notes TEXT,
    
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, completed
    approved BOOLEAN DEFAULT false, -- Legacy compatibility if needed

    -- Local Specific
    need_delivery TEXT, -- paid, free, no
    afford_amount NUMERIC,

    -- Foreign Specific
    expected_country TEXT,
    need_type TEXT, -- purchase_and_shipping, shipping_only
    budget NUMERIC,

    -- Admin Fields
    admin_notes TEXT,
    rejection_reason TEXT
);

-- 2. Enable RLS
ALTER TABLE public.medicine_requests ENABLE ROW LEVEL SECURITY;

-- 3. Policies (Public Insert, Admin View/Update)
CREATE POLICY "Public can insert requests" ON public.medicine_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all" ON public.medicine_requests FOR SELECT USING (true); -- customize for role later
CREATE POLICY "Admins can update" ON public.medicine_requests FOR UPDATE USING (true);

-- 4. Create a View to mimic the old alkhayr_requests (backward compatibility for listing)
CREATE OR REPLACE VIEW public.alkhayr_requests_v2 AS
SELECT 
    id,
    created_at,
    title,
    item_name as description, -- Map item_name to description for list view
    urgency as classification, -- Map urgency/classification
    category,
    wilaya,
    status,
    prescription_url,
    full_name as requester_name,
    request_type as origin
FROM public.medicine_requests;
