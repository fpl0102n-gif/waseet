-- 1. Drop dependent views
DROP VIEW IF EXISTS alkhayr_requests CASCADE;
DROP VIEW IF EXISTS alkhayr_requests_admin CASCADE;

-- 2. Drop Check Constraints preventing the change
ALTER TABLE local_medicine_requests DROP CONSTRAINT IF EXISTS local_medicine_requests_contact_check;
ALTER TABLE foreign_medicine_requests DROP CONSTRAINT IF EXISTS foreign_medicine_requests_contact_check;
ALTER TABLE diaspora_volunteers DROP CONSTRAINT IF EXISTS diaspora_volunteers_contact_check;

-- 3. Convert contact_type to TEXT in all tables
ALTER TABLE local_medicine_requests ALTER COLUMN contact_type TYPE text USING contact_type::text;
ALTER TABLE foreign_medicine_requests ALTER COLUMN contact_type TYPE text USING contact_type::text;
ALTER TABLE diaspora_volunteers ALTER COLUMN contact_type TYPE text USING contact_type::text;

-- 4. Recreate Views
CREATE OR REPLACE VIEW alkhayr_requests_admin AS
SELECT 
    id, 
    created_at, 
    'local_medicine_requests' as table_name,
    'local' as origin,
    full_name as requester_name,
    'phone' as contact_method, -- Legacy mapping, but now we have real contact_type
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
    null::boolean as approved, -- Local doesn't have approved column usually, but match references if needed
    email,
    contact_type -- Add the actual column
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
    null::boolean as approved,
    email,
    contact_type
FROM foreign_medicine_requests;

-- 5. Recreate Public View
CREATE OR REPLACE VIEW alkhayr_requests AS
SELECT 
    id, 
    created_at, 
    table_name,
    origin,
    -- Name masking
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
    COALESCE(admin_public_description, description) as description,
    title,
    status,
    classification,
    urgency,
    prescription_url,
    visibility,
    public_notes,
    NULL::numeric as amount,
    'DZD' as currency
FROM alkhayr_requests_admin
WHERE status IN ('accepted', 'completed') AND visibility = 'public';
