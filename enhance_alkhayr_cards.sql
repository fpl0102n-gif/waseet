-- 1. Add fields to Local Requests
ALTER TABLE public.local_medicine_requests 
ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS urgent_note TEXT;

-- Migrate existing urgency enum to boolean
UPDATE public.local_medicine_requests 
SET is_urgent = true 
WHERE urgency = 'urgent';

-- 2. Add fields to Foreign Requests
ALTER TABLE public.foreign_medicine_requests 
ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS urgent_note TEXT;

-- Migrate existing urgency enum to boolean
UPDATE public.foreign_medicine_requests 
SET is_urgent = true 
WHERE urgency = 'urgent';

-- 3. Drop views
DROP VIEW IF EXISTS public.alkhayr_requests CASCADE;
DROP VIEW IF EXISTS public.alkhayr_requests_admin CASCADE;

-- 4. Recreate Admin View
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
    l.medicine_name as description, -- Keep mapping medicine_name to description for Admin UI legacy
    l.admin_public_description,
    l.status,
    l.classification,
    l.urgency, -- Keep for legacy
    l.is_urgent, -- NEW
    l.urgent_note, -- NEW
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
    f.medicine_details as description,
    f.admin_public_description,
    f.status,
    f.classification,
    f.urgency,
    f.is_urgent, -- NEW
    f.urgent_note, -- NEW
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

-- 5. Recreate Public View
CREATE OR REPLACE VIEW public.alkhayr_requests AS
SELECT 
    id, 
    created_at, 
    table_name,
    origin,
    -- Name masking
    CASE 
        WHEN (visibility_settings->>'show_name')::boolean IS TRUE THEN requester_name 
        ELSE 'Bénéficiaire' 
    END as requester_name,
    -- City masking
    CASE 
        WHEN (visibility_settings->>'show_city')::boolean IS TRUE THEN city 
        ELSE 'Algérie' 
    END as city,
    wilaya,
    
    -- DESCRIPTION logic:
    -- User wants 'description' to be the full details (for Detail Page).
    -- Admin description maps to 'description' here usually.
    COALESCE(admin_public_description, description) as description,
    
    title,
    status,
    classification,
    urgency,
    is_urgent, -- NEW
    
    -- Regular Note (public_notes)
    public_notes as note,
    
    -- Urgent Note: Only shown if is_urgent is true
    CASE 
        WHEN is_urgent IS TRUE THEN urgent_note 
        ELSE NULL 
    END as urgent_note,

    display_order,
    
    -- IMAGE LOGIC
    CASE 
        WHEN main_image_url IS NOT NULL THEN main_image_url
        WHEN (visibility_settings->>'show_photos')::boolean IS TRUE THEN prescription_url 
        ELSE NULL 
    END as image_url, -- Use image_url alias for card main image
    
    -- Keep raw prescription_url available if needed for details
    CASE 
        WHEN (visibility_settings->>'show_photos')::boolean IS TRUE THEN prescription_url 
        ELSE NULL 
    END as prescription_url,
    
    visibility,
    
    -- Contact logic
    CASE
        WHEN (visibility_settings->>'show_contact')::boolean IS TRUE THEN contact_value
        ELSE NULL
    END as contact_phone,

    NULL::numeric as amount,
    'DZD' as currency
FROM public.alkhayr_requests_admin
WHERE LOWER(status) IN ('accepted', 'completed', 'approved');

NOTIFY pgrst, 'reload schema';
