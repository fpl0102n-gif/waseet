-- 1. Add Columns to local_medicine_requests
ALTER TABLE local_medicine_requests ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE local_medicine_requests ADD COLUMN IF NOT EXISTS admin_public_description text;
ALTER TABLE local_medicine_requests ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'private';
ALTER TABLE local_medicine_requests ADD COLUMN IF NOT EXISTS visibility_settings jsonb DEFAULT '{"show_name": false, "show_city": true, "show_contact": false, "show_photos": true}';
ALTER TABLE local_medicine_requests ADD COLUMN IF NOT EXISTS public_notes text;
ALTER TABLE local_medicine_requests ADD COLUMN IF NOT EXISTS classification text DEFAULT 'normal';
ALTER TABLE local_medicine_requests ADD COLUMN IF NOT EXISTS wilaya text;
ALTER TABLE local_medicine_requests ADD COLUMN IF NOT EXISTS email text;

-- 2. Add Columns to foreign_medicine_requests
ALTER TABLE foreign_medicine_requests ADD COLUMN IF NOT EXISTS admin_public_description text;
ALTER TABLE foreign_medicine_requests ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'private';
ALTER TABLE foreign_medicine_requests ADD COLUMN IF NOT EXISTS visibility_settings jsonb DEFAULT '{"show_name": false, "show_city": true, "show_contact": false, "show_photos": true}';
ALTER TABLE foreign_medicine_requests ADD COLUMN IF NOT EXISTS public_notes text;
ALTER TABLE foreign_medicine_requests ADD COLUMN IF NOT EXISTS classification text DEFAULT 'normal';
ALTER TABLE foreign_medicine_requests ADD COLUMN IF NOT EXISTS email text;

-- 3. Update Admin View (alkhayr_requests_admin)
DROP VIEW IF EXISTS alkhayr_requests CASCADE;
DROP VIEW IF EXISTS alkhayr_requests_admin CASCADE;

CREATE OR REPLACE VIEW alkhayr_requests_admin AS

SELECT 
    id, 
    created_at, 
    'local_medicine_requests' as table_name,
    'local' as origin,
    full_name as requester_name,
    'phone' as contact_method,
    contact_value,
    COALESCE(title, medicine_name, 'Demande Médicament') as title,
    medicine_name as description,
    admin_public_description,
    status,
    classification,
    urgency,
    city,
    wilaya,
    prescription_url,
    visibility,
    visibility_settings,
    public_notes,
    user_notes,
    admin_notes,
    approved,
    email
FROM local_medicine_requests
UNION ALL
SELECT 
    id, 
    created_at, 
    'foreign_medicine_requests' as table_name,
    'foreign' as origin,
    full_name as requester_name,
    contact_type as contact_method,
    contact_value,
    COALESCE(title, 'Demande Étranger') as title,
    medicine_details as description,
    admin_public_description,
    status,
    classification,
    urgency,
    city,
    wilaya,
    prescription_url,
    visibility,
    visibility_settings,
    public_notes,
    user_notes,
    admin_notes,
    approved,
    email
FROM foreign_medicine_requests;

-- 4. Update Public View (alkhayr_requests)
-- This view filters only accepted/public requests and masks sensitive data
CREATE OR REPLACE VIEW alkhayr_requests AS
SELECT 
    id, 
    created_at, 
    table_name,
    origin,
    -- Name masking based on visibility
    CASE 
        WHEN (visibility_settings->>'show_name')::boolean IS TRUE THEN requester_name 
        ELSE 'Bénéficiaire Anonyme' 
    END as requester_name,
    -- City masking
    CASE 
        WHEN (visibility_settings->>'show_city')::boolean IS TRUE THEN city 
        ELSE 'Algérie' 
    END as city,
    wilaya,
    -- Use Admin Description if available, else original
    COALESCE(admin_public_description, description) as description,
    title,
    status,
    classification,
    urgency,
    prescription_url, -- Logic for photos can be handled in UI, or set to null here if show_photos is false
    visibility,
    public_notes,
    -- Amount/Currency for Humanitarian (not in local yet, but general field)
    NULL::numeric as amount,
    'DZD' as currency
FROM alkhayr_requests_admin
WHERE status IN ('accepted', 'completed') AND visibility = 'public';
