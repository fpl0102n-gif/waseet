-- Create a stored procedure (RPC) to update requests securely
-- bypassing RLS policies because it's defined as SECURITY DEFINER
-- This fixes "Silent Failures" where permissions obscure the update.

CREATE OR REPLACE FUNCTION public.update_alkhayr_request_v2(
    p_id BIGINT,
    p_table TEXT,
    p_updates JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (postgres/admin)
AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Validate Table Name to prevent injection (basic check)
    IF p_table NOT IN ('local_medicine_requests', 'foreign_medicine_requests', 'diaspora_volunteers') THEN
        RAISE EXCEPTION 'Invalid table name: %', p_table;
    END IF;

    -- Dynamic SQL Update
    EXECUTE format('
        UPDATE public.%I 
        SET 
            -- Robust Fix: Convert to Text for COALESCE, then cast result back to specific ENUM
            status = COALESCE($1->>''status'', status::text)::request_status,
            classification = COALESCE($1->>''classification'', classification),
            admin_short_message = COALESCE($1->>''admin_short_message'', admin_short_message),
            admin_detailed_content = COALESCE($1->>''admin_detailed_content'', admin_detailed_content),
            main_image_url = COALESCE($1->>''main_image_url'', main_image_url),
            wilaya = COALESCE($1->>''wilaya'', wilaya),
            public_notes = COALESCE($1->>''public_notes'', public_notes),
            visibility = COALESCE($1->>''visibility'', visibility::text),
            visibility_settings = COALESCE(($1->>''visibility_settings'')::jsonb, visibility_settings),
            is_urgent = COALESCE(($1->>''is_urgent'')::boolean, is_urgent),
            urgent_note = COALESCE($1->>''urgent_note'', urgent_note),
            priority = COALESCE(($1->>''priority'')::integer, priority),
            detail_images = COALESCE($1->''detail_images'', detail_images),
            urgency = COALESCE($1->>''urgency'', urgency::text)::urgency_level
        WHERE id = $2
        RETURNING to_jsonb(%I.*);
    ', p_table, p_table)
    INTO v_result
    USING p_updates, p_id;

    IF v_result IS NULL THEN
         RAISE EXCEPTION 'Request with ID % not found in %', p_id, p_table;
    END IF;

    RETURN v_result;
END;
$$;

-- Grant access to this function
GRANT EXECUTE ON FUNCTION public.update_alkhayr_request_v2 TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
