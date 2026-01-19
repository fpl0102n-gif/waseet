-- Phase 3: Merge Medicine Requests
-- Safe Migration Plan: No Drops, Shadow Views, strict RLS.

BEGIN;

-- 1. Create the unified table
CREATE TABLE IF NOT EXISTS public.medicine_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Request Type
    request_type TEXT NOT NULL CHECK (request_type IN ('local', 'foreign')),
    
    -- Status Enum (Text for flexibility but standardized)
    status TEXT DEFAULT 'pending',

    -- Core Identity
    full_name TEXT NOT NULL,
    phone_number TEXT,     -- Migrated from contact_value
    email TEXT,
    
    -- Location
    city TEXT,
    wilaya TEXT,           -- Local usually
    expected_country TEXT, -- Foreign usually

    -- Item Details
    medicine_name TEXT,    -- Migrated from medicine_name (local) AND medicine_details (foreign)
    description TEXT,      -- Additional details if any
    category TEXT DEFAULT 'humanitarian',
    
    -- Images/Proof
    prescription_url TEXT,
    
    -- Specifics
    need_delivery BOOLEAN DEFAULT false, -- Local
    financial_ability TEXT,              -- Shared
    need_type TEXT,                      -- Foreign (purchase/shipping)
    urgency TEXT DEFAULT 'normal',       -- Shared
    is_urgent BOOLEAN DEFAULT false,     -- Shared (Admin flag)
    afford_amount NUMERIC,               -- Shared (Foreign: budget, Local: afford_amount)

    -- Admin Flags
    admin_notes TEXT,
    rejection_reason TEXT,
    approved BOOLEAN DEFAULT false,
    
    -- Legacy Tracking (Optional but safe)
    legacy_id BIGINT,
    legacy_source_table TEXT
);

-- Ensure column exists (if table was created before this column was added to script)
ALTER TABLE public.medicine_requests ADD COLUMN IF NOT EXISTS afford_amount NUMERIC;

-- 2. Enable RLS
ALTER TABLE public.medicine_requests ENABLE ROW LEVEL SECURITY;

-- 3. Define RLS Policies (Strict Parity)
-- 3.1 Public Insert
DROP POLICY IF EXISTS "Public can insert requests" ON public.medicine_requests;
CREATE POLICY "Public can insert requests" ON public.medicine_requests
    FOR INSERT WITH CHECK (true);

-- 3.2 Admin Full Access
DROP POLICY IF EXISTS "Admins have full access" ON public.medicine_requests;
CREATE POLICY "Admins have full access" ON public.medicine_requests
    FOR ALL USING (
        auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'super_admin'))
    ) WITH CHECK (
        auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'super_admin'))
    );

-- 3.3 Public View (Legacy/User)
DROP POLICY IF EXISTS "Public can view active requests" ON public.medicine_requests;
CREATE POLICY "Public can view active requests" ON public.medicine_requests
    FOR SELECT USING (
        status IN ('accepted', 'in_progress', 'handled', 'completed')
    );


-- 4. Migrate Data (COPY)
-- Safe-guard: Truncate new table to prevent duplicates if re-running
TRUNCATE public.medicine_requests;

-- 4. Conditional Data Migration & Archiving
DO $$
BEGIN
    -- Local Requests
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'archived_local_medicine_requests') THEN
        RAISE NOTICE 'Migrating from ARCHIVED local table';
        INSERT INTO public.medicine_requests (
            request_type, legacy_id, legacy_source_table, created_at, full_name, phone_number, email, city, wilaya, medicine_name, need_delivery, financial_ability, afford_amount, status, urgency, is_urgent, admin_notes, prescription_url
        )
        SELECT 
            'local', id, 'local_medicine_requests', created_at, full_name, contact_value, email, city, wilaya, medicine_name, (need_delivery = 'true'), financial_ability, afford_amount, status, urgency, is_urgent, admin_notes, prescription_url
        FROM public.archived_local_medicine_requests;
    ELSE
        RAISE NOTICE 'Migrating from ACTIVE local table';
        INSERT INTO public.medicine_requests (
            request_type, legacy_id, legacy_source_table, created_at, full_name, phone_number, email, city, wilaya, medicine_name, need_delivery, financial_ability, afford_amount, status, urgency, is_urgent, admin_notes, prescription_url
        )
        SELECT 
            'local', id, 'local_medicine_requests', created_at, full_name, contact_value, email, city, wilaya, medicine_name, (need_delivery = 'true'), financial_ability, afford_amount, status, urgency, is_urgent, admin_notes, prescription_url
        FROM public.local_medicine_requests;
        
        ALTER TABLE public.local_medicine_requests RENAME TO archived_local_medicine_requests;
    END IF;

    -- Foreign Requests
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'archived_foreign_medicine_requests') THEN
        RAISE NOTICE 'Migrating from ARCHIVED foreign table';
        INSERT INTO public.medicine_requests (
            request_type, legacy_id, legacy_source_table, created_at, full_name, phone_number, email, city, wilaya, medicine_name, expected_country, need_type, financial_ability, afford_amount, status, urgency, is_urgent, admin_notes, prescription_url
        )
        SELECT 
            'foreign', id, 'foreign_medicine_requests', created_at, full_name, contact_value, email, city, wilaya, medicine_details, expected_country, need_type, financial_ability, budget, status, urgency, is_urgent, admin_notes, prescription_url
        FROM public.archived_foreign_medicine_requests;
    ELSE
        RAISE NOTICE 'Migrating from ACTIVE foreign table';
        INSERT INTO public.medicine_requests (
            request_type, legacy_id, legacy_source_table, created_at, full_name, phone_number, email, city, wilaya, medicine_name, expected_country, need_type, financial_ability, afford_amount, status, urgency, is_urgent, admin_notes, prescription_url
        )
        SELECT 
            'foreign', id, 'foreign_medicine_requests', created_at, full_name, contact_value, email, city, wilaya, medicine_details, expected_country, need_type, financial_ability, budget, status, urgency, is_urgent, admin_notes, prescription_url
        FROM public.foreign_medicine_requests;

        ALTER TABLE public.foreign_medicine_requests RENAME TO archived_foreign_medicine_requests;
    END IF;
END $$;


-- 6. Disable Triggers on Archives
DROP TRIGGER IF EXISTS on_local_medicine_status_update ON public.archived_local_medicine_requests;
DROP TRIGGER IF EXISTS on_foreign_medicine_status_update ON public.archived_foreign_medicine_requests;


-- 7. Create Shadow Views (Backward Compatibility)
-- 7.1 Local View
DROP VIEW IF EXISTS public.local_medicine_requests;
CREATE VIEW public.local_medicine_requests AS
SELECT 
    legacy_id as id, -- Returns OLD ID type (BigInt) for GET calls, but new inserts won't have it (Null). 
    -- WARNING: For insertions via this View (if any), ID is problematic. 
    -- But since we only read via View, returning legacy_id creates continuity for OLD records.
    -- For NEW records, legacy_id is NULL. This might break "Get By ID" for new records if client expects Int.
    -- Better strategy for View ID: We can't generate an Int ID dynamically easily. 
    -- For now, returning legacy_id is the safest for reading OLD data.
    created_at,
    full_name,
    phone_number as contact_value,
    email,
    city,
    wilaya,
    medicine_name,
    CASE WHEN need_delivery THEN 'true' ELSE 'false' END as need_delivery, -- Cast back to text match old schema
    financial_ability,
    afford_amount,
    status,
    urgency,
    is_urgent,
    admin_notes,
    prescription_url
FROM public.medicine_requests
WHERE request_type = 'local';

-- 7.2 Foreign View
DROP VIEW IF EXISTS public.foreign_medicine_requests;
CREATE VIEW public.foreign_medicine_requests AS
SELECT 
    legacy_id as id,
    created_at,
    full_name,
    phone_number as contact_value,
    email,
    city,
    wilaya,
    medicine_name as medicine_details,
    expected_country,
    need_type,
    financial_ability,
    afford_amount as budget, -- Map back to budget
    status,
    urgency,
    is_urgent,
    admin_notes,
    prescription_url
FROM public.medicine_requests
WHERE request_type = 'foreign';


-- 8. Re-Attach Triggers (Active Mode)
DROP TRIGGER IF EXISTS on_medicine_request_status_update ON public.medicine_requests;
CREATE TRIGGER on_medicine_request_status_update
    AFTER UPDATE OF status ON public.medicine_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_email('alkhayr_request_update');

COMMIT;
