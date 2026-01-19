-- 1. Add PRIORITY field to Local Requests
ALTER TABLE public.local_medicine_requests 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS urgent_note TEXT;

-- 2. Add PRIORITY field to Foreign Requests
ALTER TABLE public.foreign_medicine_requests 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS urgent_note TEXT;

-- 3. Drop existing views to rebuild them
DROP VIEW IF EXISTS public.alkhayr_requests CASCADE;
DROP VIEW IF EXISTS public.alkhayr_requests_admin CASCADE;

-- 4. Recreate Admin View (Expose Priority)
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
    l.is_urgent,
    l.urgent_note,
    l.priority, -- NEW
    l.display_order, -- Keep for legacy if needed, but priority supersedes
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
    f.medicine_details as description,
    f.admin_public_description,
    f.status,
    f.classification,
    f.urgency,
    f.is_urgent,
    f.urgent_note,
    f.priority, -- NEW
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

-- 5. Recreate Public View (Sorted by Rules)
-- Rules: 
-- 1. is_urgent DESC (True first)
-- 2. priority ASC (1=High, 5=Low)
-- 3. created_at DESC (Newest first)
CREATE OR REPLACE VIEW public.alkhayr_requests AS
SELECT 
    id, 
    created_at, 
    table_name,
    origin,
    CASE 
        WHEN (visibility_settings->>'show_name')::boolean IS TRUE THEN requester_name 
        ELSE 'Bénéficiaire' 
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
    is_urgent,
    urgent_note,
    priority, -- NEW
    public_notes as note,
    
    -- IMAGE LOGIC
    CASE 
        WHEN main_image_url IS NOT NULL THEN main_image_url
        WHEN (visibility_settings->>'show_photos')::boolean IS TRUE THEN prescription_url 
        ELSE NULL 
    END as image_url,
    
    CASE 
        WHEN (visibility_settings->>'show_photos')::boolean IS TRUE THEN prescription_url 
        ELSE NULL 
    END as prescription_url,
    
    visibility,
    
    CASE
        WHEN (visibility_settings->>'show_contact')::boolean IS TRUE THEN contact_value
        ELSE NULL
    END as contact_phone,

    NULL::numeric as amount,
    'DZD' as currency
FROM public.alkhayr_requests_admin
-- View Filters: Case insensitive status check, exclude 'archived' if you have that status
WHERE LOWER(status) IN ('accepted', 'completed', 'approved')
-- Ensure sorting is applied in View Default if possible, but clients usually sort.
ORDER BY 
    is_urgent DESC,
    priority ASC,
    created_at DESC;

NOTIFY pgrst, 'reload schema';
