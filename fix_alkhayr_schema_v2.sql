-- 1. Add columns to underlying tables
ALTER TABLE public.local_medicine_requests 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

ALTER TABLE public.foreign_medicine_requests 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 2. Drop existing views to allow updates
DROP VIEW IF EXISTS public.alkhayr_requests;
DROP VIEW IF EXISTS public.alkhayr_requests_admin;

-- 3. Recreate Admin View (alkhayr_requests_admin)
-- Adding display_order
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
    l.medicine_name as description,
    l.admin_public_description,
    l.status,
    l.classification,
    l.urgency,
    l.display_order,
    l.city,
    l.wilaya,
    l.prescription_url,
    l.visibility,
    l.visibility_settings,
    l.public_notes,
    l.user_notes,
    l.admin_notes,
    l.approved,
    l.email,
    -- Financial columns for completeness
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
    f.medicine_details as description,
    f.admin_public_description,
    f.status,
    f.classification,
    f.urgency,
    f.display_order,
    f.city,
    f.wilaya,
    f.prescription_url,
    f.visibility,
    f.visibility_settings,
    f.public_notes,
    f.user_notes,
    f.admin_notes,
    f.approved,
    f.email,
    -- Financial columns for completeness
    f.financial_ability::text,
    f.budget as afford_amount,
    NULL as need_delivery
FROM public.foreign_medicine_requests f;

-- 4. Recreate Public View (alkhayr_requests)
-- Adding display_order
CREATE OR REPLACE VIEW public.alkhayr_requests AS
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
    -- Use Admin Description if available, else original description (mapped from medicine_name/details)
    COALESCE(admin_public_description, description) as description,
    title,
    status,
    classification,
    urgency,
    display_order,
    -- Photo masking
    CASE 
        WHEN (visibility_settings->>'show_photos')::boolean IS TRUE THEN prescription_url 
        ELSE NULL 
    END as prescription_url,
    
    visibility,
    public_notes,
    
    -- Contact logic (exposed if allowed)
    CASE
        WHEN (visibility_settings->>'show_contact')::boolean IS TRUE THEN contact_value
        ELSE NULL
    END as contact_phone,

    NULL::numeric as amount,
    'DZD' as currency
FROM public.alkhayr_requests_admin
WHERE status IN ('accepted', 'completed', 'approved') AND visibility = 'public';

NOTIFY pgrst, 'reload schema';
