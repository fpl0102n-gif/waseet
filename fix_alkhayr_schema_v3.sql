-- 1. Ensure all columns exist on Local Requests
ALTER TABLE public.local_medicine_requests 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS admin_public_description TEXT,
ADD COLUMN IF NOT EXISTS admin_short_message TEXT,
ADD COLUMN IF NOT EXISTS admin_detailed_content TEXT,
ADD COLUMN IF NOT EXISTS detail_images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS main_image_url TEXT,
ADD COLUMN IF NOT EXISTS public_notes TEXT,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private',
ADD COLUMN IF NOT EXISTS visibility_settings JSONB DEFAULT '{"show_name": false, "show_city": true, "show_contact": false, "show_photos": true}',
ADD COLUMN IF NOT EXISTS classification TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS urgent_note TEXT,
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS wilaya TEXT;

-- 2. Ensure all columns exist on Foreign Requests
ALTER TABLE public.foreign_medicine_requests 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS admin_public_description TEXT,
ADD COLUMN IF NOT EXISTS admin_short_message TEXT,
ADD COLUMN IF NOT EXISTS admin_detailed_content TEXT,
ADD COLUMN IF NOT EXISTS detail_images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS main_image_url TEXT,
ADD COLUMN IF NOT EXISTS public_notes TEXT,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private',
ADD COLUMN IF NOT EXISTS visibility_settings JSONB DEFAULT '{"show_name": false, "show_city": true, "show_contact": false, "show_photos": true}',
ADD COLUMN IF NOT EXISTS classification TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS urgent_note TEXT,
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS wilaya TEXT;

-- 3. Drop existing views to allow updates
DROP VIEW IF EXISTS public.alkhayr_requests CASCADE;
DROP VIEW IF EXISTS public.alkhayr_requests_admin CASCADE;

-- 4. Recreate Admin View (alkhayr_requests_admin)
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
    l.medicine_name,
    l.description,
    l.admin_public_description,
    l.admin_short_message,
    l.admin_detailed_content,
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
    l.detail_images,
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
    f.medicine_details as medicine_name,
    COALESCE(f.description, f.medicine_details) as description,
    f.admin_public_description,
    f.admin_short_message,
    f.admin_detailed_content,
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
    f.detail_images,
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

-- 5. Recreate Public View (alkhayr_requests)
CREATE OR REPLACE VIEW public.alkhayr_requests AS
SELECT 
    id, 
    created_at, 
    table_name,
    origin,
    -- Name masking (Initials)
    CASE 
        WHEN (visibility_settings->>'show_name')::boolean IS TRUE THEN requester_name 
        ELSE 'Bénéficiaire' 
    END as requester_name,
    
    city,
    wilaya,
    
    -- 3.1 Short Public Message (List View)
    COALESCE(admin_short_message, 'Détails disponibles sur demande.') as note,
    
    -- 3.2 Detailed Admin Content (Detail Page)
    COALESCE(admin_detailed_content, admin_short_message, 'Aucune description détaillée.') as description,
    
    title,
    status,
    classification,
    urgency,
    is_urgent,
    urgent_note,
    priority,
    display_order,
    
    -- Images
    main_image_url as image_url,
    detail_images,
    
    -- Photo masking legacy fallback
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
-- Status Rules: include in_progress and matched
WHERE status IN ('accepted', 'completed', 'approved', 'in_progress', 'matched') 
AND visibility = 'public';

NOTIFY pgrst, 'reload schema';
