-- Add array columns for multiple images
-- 1. detail_images for Medicine Photos (Array of URLs)
ALTER TABLE public.local_medicine_requests 
ADD COLUMN IF NOT EXISTS detail_images TEXT[] DEFAULT '{}';

ALTER TABLE public.foreign_medicine_requests 
ADD COLUMN IF NOT EXISTS detail_images TEXT[] DEFAULT '{}';

-- 2. prescription_images for Ordonnance (Array of URLs) - allowing multiple pages
ALTER TABLE public.local_medicine_requests 
ADD COLUMN IF NOT EXISTS prescription_images TEXT[] DEFAULT '{}';

ALTER TABLE public.foreign_medicine_requests 
ADD COLUMN IF NOT EXISTS prescription_images TEXT[] DEFAULT '{}';

-- 3. Update Views to include these arrays
DROP VIEW IF EXISTS public.alkhayr_requests_admin CASCADE;
DROP VIEW IF EXISTS public.alkhayr_requests CASCADE;

CREATE OR REPLACE VIEW public.alkhayr_requests_admin AS
SELECT 
    l.id,
    l.created_at,
    'local_medicine_requests' as table_name,
    'local' as origin,
    l.full_name as requester_name,
    'phone' as contact_method,
    l.contact_value,
    l.whatsapp,
    l.telegram,
    l.email,
    COALESCE(l.title, l.medicine_name, 'Demande Médicament') as title,
    l.medicine_name,
    l.description,
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
    l.prescription_images, -- NEW
    l.main_image_url,
    l.detail_images, -- NEW
    l.financial_ability,
    l.offered_amount,
    l.need_delivery::text as need_delivery, 
    l.user_priority,
    l.visibility_settings,
    l.visibility,
    l.public_notes
FROM public.local_medicine_requests l
UNION ALL
SELECT 
    f.id,
    f.created_at,
    'foreign_medicine_requests' as table_name,
    'foreign' as origin,
    f.full_name as requester_name,
    'phone' as contact_method,
    f.contact_value,
    f.whatsapp,
    f.telegram,
    f.email,
    COALESCE(f.title, f.medicine_name, 'Demande Médicament') as title,
    f.medicine_name,
    f.description,
    f.admin_public_description,
    f.status,
    f.classification,
    f.urgency,
    f.is_urgent,
    f.urgent_note,
    f.priority,
    f.display_order,
    f.city,
    'Étranger' as wilaya,
    f.prescription_url,
    f.prescription_images, -- NEW
    f.main_image_url,
    f.detail_images, -- NEW
    f.financial_ability,
    f.offered_amount,
    f.need_delivery::text as need_delivery,
    f.user_priority,
    f.visibility_settings,
    f.visibility,
    f.public_notes
FROM public.foreign_medicine_requests f;

-- Recreate Public View (Same as before, mainly uses admin view)
CREATE OR REPLACE VIEW public.alkhayr_requests AS
SELECT 
    id, 
    created_at, 
    table_name,
    origin,
    CASE 
        WHEN (visibility_settings->>'show_name')::boolean IS TRUE THEN requester_name 
        ELSE 'Bénéficiaire Anonyme' 
    END as requester_name,
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
    display_order,
    -- Photo masking (Single URL for listing, but detail_images could be exposed if we want)
    CASE 
        WHEN (visibility_settings->>'show_photos')::boolean IS TRUE THEN prescription_url 
        ELSE NULL 
    END as prescription_url,
    
    visibility,
    public_notes,
    
    CASE
        WHEN (visibility_settings->>'show_contact')::boolean IS TRUE THEN contact_value
        ELSE NULL
    END as contact_phone,

    NULL::numeric as amount,
    'DZD' as currency
FROM public.alkhayr_requests_admin
WHERE status IN ('accepted', 'completed', 'approved') AND visibility = 'public';
