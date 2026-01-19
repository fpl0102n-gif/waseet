-- Ensure description column exists in local_medicine_requests
ALTER TABLE public.local_medicine_requests 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS request_type TEXT DEFAULT 'request',
ADD COLUMN IF NOT EXISTS main_image_url TEXT;

-- Ensure description column exists in foreign_medicine_requests
ALTER TABLE public.foreign_medicine_requests 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS request_type TEXT DEFAULT 'request',
ADD COLUMN IF NOT EXISTS main_image_url TEXT;

-- Update Admin View to use the new description column if available
CREATE OR REPLACE VIEW public.alkhayr_requests_admin AS
SELECT 
    l.id,
    l.created_at,
    'local_medicine_requests' as table_name,
    'local' as origin,
    l.full_name as requester_name,
    'phone' as contact_method,
    l.contact_value,
    COALESCE(l.title, l.medicine_name, 'Demande Médicament') as title,
    -- Use description if exists, else medicine_name
    COALESCE(l.description, l.medicine_name) as description, 
    l.admin_public_description,
    l.status,
    l.classification,
    l.urgency, 
    l.is_urgent,
    l.urgent_note,
    l.priority,
    l.display_order,
    l.city,
    l.wilaya,
    l.prescription_url,
    l.main_image_url,
    l.visibility,
    l.visibility_settings,
    l.public_notes,
    l.user_notes,
    l.admin_notes,
    l.approved,
    l.email,
    l.financial_ability::text,
    l.afford_amount,
    l.need_delivery::text
FROM public.local_medicine_requests l
UNION ALL
SELECT 
    f.id,
    f.created_at,
    'foreign_medicine_requests' as table_name,
    'foreign' as origin,
    f.full_name as requester_name,
    f.contact_type as contact_method,
    f.contact_value,
    COALESCE(f.title, 'Demande Étranger') as title,
    COALESCE(f.description, f.medicine_details) as description,
    f.admin_public_description,
    f.status,
    f.classification,
    f.urgency,
    f.is_urgent,
    f.urgent_note,
    f.priority,
    f.display_order,
    f.city,
    f.wilaya,
    f.prescription_url,
    f.main_image_url,
    f.visibility,
    f.visibility_settings,
    f.public_notes,
    f.user_notes,
    f.admin_notes,
    f.approved,
    f.email,
    f.financial_ability::text,
    f.budget as afford_amount,
    NULL as need_delivery
FROM public.foreign_medicine_requests f;

NOTIFY pgrst, 'reload schema';
