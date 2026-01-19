-- 1. Add Admin Control Fields to Local Requests
ALTER TABLE public.local_medicine_requests 
ADD COLUMN IF NOT EXISTS admin_short_message TEXT,
ADD COLUMN IF NOT EXISTS admin_detailed_content TEXT,
ADD COLUMN IF NOT EXISTS detail_images JSONB DEFAULT '[]'::jsonb;

-- 2. Add Admin Control Fields to Foreign Requests
ALTER TABLE public.foreign_medicine_requests 
ADD COLUMN IF NOT EXISTS admin_short_message TEXT,
ADD COLUMN IF NOT EXISTS admin_detailed_content TEXT,
ADD COLUMN IF NOT EXISTS detail_images JSONB DEFAULT '[]'::jsonb;

-- 3. Update Status Logic (Ensure Enum values if using Enum, or Check Constraint)
-- Checking if status column is text or enum. Assuming text for flexibility based on previous outputs.
-- We will enforce status values in the UI, but let's drop constraints if strict to allow 'handled'
ALTER TABLE public.local_medicine_requests DROP CONSTRAINT IF EXISTS local_medicine_requests_status_check;
ALTER TABLE public.local_medicine_requests ADD CONSTRAINT local_medicine_requests_status_check 
    CHECK (status IN ('pending', 'accepted', 'rejected', 'handled', 'approved', 'cancelled', 'completed')); 
    -- retaining old values for safety migration, new logic uses pending, accepted, rejected, handled.

ALTER TABLE public.foreign_medicine_requests DROP CONSTRAINT IF EXISTS foreign_medicine_requests_status_check;
ALTER TABLE public.foreign_medicine_requests ADD CONSTRAINT foreign_medicine_requests_status_check 
    CHECK (status IN ('pending', 'accepted', 'rejected', 'handled', 'approved', 'cancelled', 'completed'));

-- 4. Recreate Admin View to include new fields
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
    -- Display Title Logic: Admin Short Message is for list description, Title is generic or medicine name. 
    -- User wants: "Request Title" in list. Let's stick to medicine_name as Title for now or add specific admin_title if needed.
    COALESCE(l.title, l.medicine_name, 'Demande Médicament') as title,
    l.medicine_name as original_medicine_name,
    l.description as original_description,
    l.admin_public_description, -- Keeping for legacy/migration
    l.admin_short_message, -- NEW: For List View
    l.admin_detailed_content, -- NEW: For Detail View
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
    l.detail_images, -- NEW
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
    f.medicine_details as original_medicine_name, -- approximated
    COALESCE(f.description, f.medicine_details) as original_description,
    f.admin_public_description,
    f.admin_short_message, -- NEW
    f.admin_detailed_content, -- NEW
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
    f.detail_images, -- NEW
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

-- 5. Recreate Public View (Strict Logic)
DROP VIEW IF EXISTS public.alkhayr_requests CASCADE;
CREATE OR REPLACE VIEW public.alkhayr_requests AS
SELECT 
    id, 
    created_at, 
    table_name,
    origin,
    
    -- Name masking (Initials)
    CASE 
        WHEN (visibility_settings->>'show_name')::boolean IS TRUE THEN requester_name 
        ELSE 'Bénéficiaire' -- UI handles initials if name is provided, view just passes data safely? 
        -- User said: "Mask Requester Names (Initials only)". UI `getInitials` does this. 
        -- But for privacy, maybe we should just send initials from DB? 
        -- Let's stick to current logic: Mask if private, else send name and UI formats it.
    END as requester_name,
    
    city,
    wilaya,
    
    -- 3.1 Short Public Message (MANDATORY in List)
    -- "Replaces raw user description in list view"
    COALESCE(admin_short_message, 'Détails disponibles sur demande.') as note,
    
    -- 3.2 Detailed Admin Content (Detail Page Only)
    COALESCE(admin_detailed_content, admin_short_message, 'Aucune description détaillée.') as description,
    
    title,
    status,
    classification, -- maybe internal
    urgency,
    is_urgent,
    urgent_note, -- Only visible if is_urgent is true, enforced by frontend but good to expose
    priority,
    
    -- Images
    main_image_url as image_url, -- Admin selected main image
    detail_images, -- For gallery
    prescription_url, -- fallback or specific use
    
    visibility,
    
    -- Contact logic already handled by UI dialogs via settings
    NULL as contact_phone

FROM public.alkhayr_requests_admin
-- Status Rules: 
-- pending -> shown with label (so include in view)
-- accepted -> shown
-- handled -> shown
-- rejected -> NEVER SHOWN
WHERE status IN ('pending', 'accepted', 'handled', 'approved', 'completed') 
-- 'approved'/'completed' kept for migration, maps to accepted/handled
AND visibility = 'public'
ORDER BY 
    is_urgent DESC,
    CASE WHEN status = 'handled' THEN 1 ELSE 0 END ASC, -- "Not handled before handled"
    created_at DESC;

NOTIFY pgrst, 'reload schema';
