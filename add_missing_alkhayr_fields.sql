-- 1. Drop Views First (CASCADE is essential because public view depends on admin view)
DROP VIEW IF EXISTS public.alkhayr_requests CASCADE;
DROP VIEW IF EXISTS public.alkhayr_requests_admin CASCADE;

-- 2. Add Columns to Local Medicine Requests
ALTER TABLE public.local_medicine_requests ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.local_medicine_requests ADD COLUMN IF NOT EXISTS family_status TEXT;
ALTER TABLE public.local_medicine_requests ADD COLUMN IF NOT EXISTS monthly_income NUMERIC;
ALTER TABLE public.local_medicine_requests ADD COLUMN IF NOT EXISTS disease_name TEXT;
ALTER TABLE public.local_medicine_requests ADD COLUMN IF NOT EXISTS contact_type TEXT DEFAULT 'phone';

-- 3. Add Columns to Foreign Medicine Requests
ALTER TABLE public.foreign_medicine_requests ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.foreign_medicine_requests ADD COLUMN IF NOT EXISTS family_status TEXT;
ALTER TABLE public.foreign_medicine_requests ADD COLUMN IF NOT EXISTS monthly_income NUMERIC;
ALTER TABLE public.foreign_medicine_requests ADD COLUMN IF NOT EXISTS disease_name TEXT;

-- 4. Recreate Admin View (alkhayr_requests_admin) with ALL fields
CREATE OR REPLACE VIEW public.alkhayr_requests_admin AS
SELECT 
    l.id,
    l.created_at,
    'local_medicine_requests' as table_name,
    'local' as origin,
    l.full_name as requester_name,
    COALESCE(l.contact_type, 'phone') as contact_method,
    l.contact_value,
    l.whatsapp,
    l.telegram,
    l.email,
    -- NEW RAW COLUMNS
    l.contact_type, 
    l.address,      
    l.family_status, 
    l.monthly_income, 
    l.disease_name, 
    
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
    l.prescription_images,
    l.main_image_url,
    l.detail_images,
    l.financial_ability,
    l.offered_amount,
    l.need_delivery::text as need_delivery, 
    l.user_priority,
    l.visibility_settings,
    l.visibility,
    l.public_notes,
    
    -- V3 Admin Columns
    l.display_name,
    l.display_wilaya,
    l.display_area,
    l.display_summary,
    l.display_description,
    l.display_main_image,
    l.display_images,
    l.display_is_urgent

FROM public.local_medicine_requests l
UNION ALL
SELECT 
    f.id,
    f.created_at,
    'foreign_medicine_requests' as table_name,
    'foreign' as origin,
    f.full_name as requester_name,
    COALESCE(f.contact_type, 'phone') as contact_method,
    f.contact_value,
    f.whatsapp,
    f.telegram,
    f.email,
    -- NEW RAW COLUMNS
    f.contact_type, 
    f.address,      
    f.family_status, 
    f.monthly_income, 
    f.disease_name, 

    COALESCE(f.title, f.medicine_name, 'Demande Médicament') as title,
    f.medicine_details as medicine_name,

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
    f.prescription_images,
    f.main_image_url,
    f.detail_images,
    f.financial_ability,
    f.offered_amount,
    f.need_delivery::text as need_delivery,
    f.user_priority,
    f.visibility_settings,
    f.visibility,
    f.public_notes,

    -- V3 Admin Columns
    f.display_name,
    f.display_wilaya,
    f.display_area,
    f.display_summary,
    f.display_description,
    f.display_main_image,
    f.display_images,
    f.display_is_urgent

FROM public.foreign_medicine_requests f;

-- 5. Recreate Public View (alkhayr_requests) - Essential to prevent site breakage
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
    -- Use Admin Description if available, else original description
    COALESCE(admin_public_description, description) as description,
    
    -- V3 Display Fields (Preferred if they exist, but fallback to logic above)
    display_name,
    display_wilaya,
    display_area,
    display_summary,
    display_description,
    display_main_image,
    display_images,
    display_is_urgent,
    
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
    
    -- Contact logic
    CASE
        WHEN (visibility_settings->>'show_contact')::boolean IS TRUE THEN contact_value
        ELSE NULL
    END as contact_phone,

    NULL::numeric as amount,
    'DZD' as currency
FROM public.alkhayr_requests_admin
WHERE status IN ('accepted', 'completed', 'approved', 'in_progress', 'handled') 
AND visibility = 'public';

-- 6. Notify Schema Refresh
NOTIFY pgrst, 'reload schema';
