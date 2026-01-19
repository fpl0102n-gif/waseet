-- FIXED SCRIPT: Force need_delivery to Boolean
-- 1. Drop dependent views FIRST
DROP VIEW IF EXISTS public.alkhayr_requests CASCADE;
DROP VIEW IF EXISTS public.alkhayr_requests_admin CASCADE;


-- 2. Alter Column Types
-- Fix financial_ability Enum Issue (Convert to TEXT)
ALTER TABLE public.local_medicine_requests 
DROP CONSTRAINT IF EXISTS local_medicine_requests_financial_ability_check;

ALTER TABLE public.local_medicine_requests 
ALTER COLUMN financial_ability TYPE TEXT USING financial_ability::text;

ALTER TABLE public.foreign_medicine_requests 
DROP CONSTRAINT IF EXISTS foreign_medicine_requests_financial_ability_check;

ALTER TABLE public.foreign_medicine_requests 
ALTER COLUMN financial_ability TYPE TEXT USING financial_ability::text;


-- 3. Fix need_delivery (Drop Enum column, recreate as Boolean)
-- This destroys existing data in this column, but ensures type safety with Frontend
ALTER TABLE public.local_medicine_requests DROP COLUMN IF EXISTS need_delivery CASCADE;
ALTER TABLE public.local_medicine_requests ADD COLUMN need_delivery BOOLEAN DEFAULT FALSE;

ALTER TABLE public.foreign_medicine_requests DROP COLUMN IF EXISTS need_delivery CASCADE;
ALTER TABLE public.foreign_medicine_requests ADD COLUMN need_delivery BOOLEAN DEFAULT FALSE;


-- 4. Add other Missing Columns (Ensure ALL columns used in views exist)
ALTER TABLE public.local_medicine_requests ADD COLUMN IF NOT EXISTS offered_amount TEXT;
ALTER TABLE public.foreign_medicine_requests ADD COLUMN IF NOT EXISTS offered_amount TEXT;

ALTER TABLE public.local_medicine_requests ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.local_medicine_requests ADD COLUMN IF NOT EXISTS telegram TEXT;
ALTER TABLE public.local_medicine_requests ADD COLUMN IF NOT EXISTS user_priority TEXT;

ALTER TABLE public.foreign_medicine_requests ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.foreign_medicine_requests ADD COLUMN IF NOT EXISTS telegram TEXT;
ALTER TABLE public.foreign_medicine_requests ADD COLUMN IF NOT EXISTS user_priority TEXT;

ALTER TABLE public.local_medicine_requests ADD COLUMN IF NOT EXISTS visibility_settings JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.local_medicine_requests ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'pending';
ALTER TABLE public.local_medicine_requests ADD COLUMN IF NOT EXISTS admin_public_description TEXT;
ALTER TABLE public.local_medicine_requests ADD COLUMN IF NOT EXISTS public_notes TEXT;

ALTER TABLE public.foreign_medicine_requests ADD COLUMN IF NOT EXISTS visibility_settings JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.foreign_medicine_requests ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'pending';
ALTER TABLE public.foreign_medicine_requests ADD COLUMN IF NOT EXISTS admin_public_description TEXT;
ALTER TABLE public.foreign_medicine_requests ADD COLUMN IF NOT EXISTS public_notes TEXT;


-- 5. Recreate Views 
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
    l.main_image_url,
    l.detail_images,
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
    f.main_image_url,
    f.detail_images,
    f.financial_ability,
    f.offered_amount,
    f.need_delivery::text as need_delivery,
    f.user_priority,
    f.visibility_settings,
    f.visibility,
    f.public_notes
FROM public.foreign_medicine_requests f;

-- Recreate Public View
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

-- 6. Helper Policies
ALTER TABLE public.local_medicine_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foreign_medicine_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert local requests" ON public.local_medicine_requests;
CREATE POLICY "Public can insert local requests" 
ON public.local_medicine_requests FOR INSERT 
TO public 
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can insert foreign requests" ON public.foreign_medicine_requests;
CREATE POLICY "Public can insert foreign requests" 
ON public.foreign_medicine_requests FOR INSERT 
TO public 
WITH CHECK (true);
