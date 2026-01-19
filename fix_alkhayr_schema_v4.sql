-- 1. Add new private columns to Local Requests
ALTER TABLE public.local_medicine_requests
ADD COLUMN IF NOT EXISTS medicine_name TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS telegram TEXT,
ADD COLUMN IF NOT EXISTS financial_ability TEXT, -- 'full', 'partial', 'none'
ADD COLUMN IF NOT EXISTS offered_amount TEXT,
ADD COLUMN IF NOT EXISTS need_delivery BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS user_priority TEXT DEFAULT 'normal'; -- 'normal', 'important', 'urgent'

-- 2. Add new private columns to Foreign Requests
ALTER TABLE public.foreign_medicine_requests
ADD COLUMN IF NOT EXISTS medicine_name TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS telegram TEXT,
ADD COLUMN IF NOT EXISTS financial_ability TEXT,
ADD COLUMN IF NOT EXISTS offered_amount TEXT,
ADD COLUMN IF NOT EXISTS need_delivery BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS user_priority TEXT DEFAULT 'normal';

-- 3. Recreate Admin View to include these new fields
-- First drop to ensure clean creation
DROP VIEW IF EXISTS public.alkhayr_requests_admin CASCADE;

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
    l.admin_short_message,
    l.admin_detailed_content,
    l.visibility,
    l.visibility_settings,
    l.public_notes,
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
    l.prescription_url as user_proof_url, -- Alias for frontend compatibility
    l.financial_ability,
    l.offered_amount,
    l.need_delivery::text as need_delivery,
    l.user_priority
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
    f.admin_short_message,
    f.admin_detailed_content,
    f.visibility,
    f.visibility_settings,
    f.public_notes,
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
    f.main_image_url,
    f.detail_images,
    f.prescription_url as user_proof_url,
    f.financial_ability,
    f.offered_amount,
    f.need_delivery::text as need_delivery,
    f.user_priority
FROM public.foreign_medicine_requests f;

-- 5. Recreate Public View (alkhayr_requests)
-- This view MUST be recreated because it depends on alkhayr_requests_admin which was dropped
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
    COALESCE(admin_short_message, medicine_name) as note,
    
    -- 3.2 Full Detailed Content (Detail View)
    COALESCE(admin_detailed_content, description) as description,
    
    -- 3.3 Status & Logic
    status,
    is_urgent,
    urgent_note,
    priority,
    display_order,
    
    -- 3.4 Images
    main_image_url as image_url, -- The curated Main Image
    detail_images,               -- The curated Gallery
    
    -- 3.5 Contact (Only if allowed, though frontend hides it mostly)
    CASE 
        WHEN (visibility_settings->>'show_contact')::boolean IS TRUE THEN contact_value 
        ELSE NULL 
    END as contact_phone,
    
    -- 3.6 Urgency Level
    urgency
    
FROM public.alkhayr_requests_admin
WHERE status IN ('pending', 'accepted', 'in_progress', 'matched', 'handled', 'completed')
AND (visibility = 'public' OR visibility IS NULL);

-- 6. Notify potential listeners (PostgREST schema cache)
NOTIFY pgrst, 'reload schema';
