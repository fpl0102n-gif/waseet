-- Add visibility_settings and admin_public_description columns

-- Local Requests
ALTER TABLE local_medicine_requests 
ADD COLUMN IF NOT EXISTS visibility_settings JSONB DEFAULT '{"show_name": false, "show_city": true, "show_contact": false, "show_photos": true}'::jsonb,
ADD COLUMN IF NOT EXISTS admin_public_description TEXT;

-- Foreign Requests
ALTER TABLE foreign_medicine_requests 
ADD COLUMN IF NOT EXISTS visibility_settings JSONB DEFAULT '{"show_name": false, "show_city": true, "show_contact": false, "show_photos": true}'::jsonb,
ADD COLUMN IF NOT EXISTS admin_public_description TEXT;

-- Recreate the View
DROP VIEW IF EXISTS alkhayr_requests;

CREATE OR REPLACE VIEW alkhayr_requests AS
SELECT 
    l.id,
    COALESCE(l.title, l.medicine_name) as title,
    l.medicine_name as description, -- Keep original description/name for admin view
    l.category,
    l.classification,
    l.wilaya as wilaya, -- Using wilaya column
    l.urgency,
    l.status,
    l.full_name as requester_name,
    l.contact_value, -- direct usage
    NULL as currency,
    l.afford_amount::numeric as amount, -- Cast to numeric if needed or just alias
    l.created_at,
    l.created_at as accepted_at,
    'local_medicine_requests' as origin,
    'local_medicine_requests' as table_name,
    l.prescription_url,
    l.public_notes,
    l.visibility,
    l.email,
    l.visibility_settings,
    l.admin_public_description
FROM local_medicine_requests l

UNION ALL

SELECT 
    f.id,
    COALESCE(f.title, f.medicine_details) as title,
    f.medicine_details as description,
    f.category,
    f.classification,
    f.wilaya as wilaya,
    f.urgency,
    f.status,
    f.full_name as requester_name,
    f.contact_value,
    'DZD' as currency, -- Default currency or derived
    f.budget as amount,
    f.created_at,
    f.created_at as accepted_at,
    'foreign_medicine_requests' as origin,
    'foreign_medicine_requests' as table_name,
    f.prescription_url,
    f.public_notes,
    f.visibility,
    f.email,
    f.visibility_settings,
    f.admin_public_description
FROM foreign_medicine_requests f;
