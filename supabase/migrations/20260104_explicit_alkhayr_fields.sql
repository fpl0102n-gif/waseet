-- Add explicit fields for Admin Visibility
-- User requested: "Photo(s) (optional)", "Target Country", "WhatsApp", "Telegram"
-- Target Country already exists (expected_country).
-- We add the missing ones to `medicine_requests`.

ALTER TABLE public.medicine_requests
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS telegram TEXT,
ADD COLUMN IF NOT EXISTS detail_images TEXT[]; -- Array of URLs for multiple images

-- Refresh Views (if they SELECT *)
-- If views explicitly list columns, they won't show new columns unless updated.
-- We updated views in Phase 3 to map to specific columns.
-- For Admin Panel (reading directly from table), this ALTER is enough locally.
-- For Views (Local/Foreign), we should add them if backward compatibility needs them?
-- Legacy tables didn't have them, so Views don't strictly need them unless App V1 accesses them.
-- AlKhayrAdmin likely reads from `medicine_requests` strictly now (if we updated it).
-- We will update Views just in case.

CREATE OR REPLACE VIEW public.local_medicine_requests AS
SELECT 
    legacy_id as id, 
    created_at, full_name, phone_number as contact_value, email, city, wilaya, 
    medicine_name, 
    CASE WHEN need_delivery THEN 'true' ELSE 'false' END as need_delivery, 
    financial_ability, afford_amount, status, urgency, is_urgent, admin_notes, prescription_url,
    whatsapp, telegram, detail_images
FROM public.medicine_requests
WHERE request_type = 'local';

CREATE OR REPLACE VIEW public.foreign_medicine_requests AS
SELECT 
    legacy_id as id,
    created_at, full_name, phone_number as contact_value, email, city, wilaya, 
    medicine_name as medicine_details, 
    expected_country, need_type, 
    financial_ability, afford_amount as budget, status, urgency, is_urgent, admin_notes, prescription_url,
    whatsapp, telegram, detail_images
FROM public.medicine_requests
WHERE request_type = 'foreign';
