-- Force unlock the user as a super_admin (Version 2)
-- Uses a PL/PGSQL block to avoid "ON CONFLICT" constraint issues if the table doesn't have a unique constraint on user_id.

DO $$
DECLARE
    target_user_id uuid := 'cd22d408-73b7-4d55-877d-f72a5f00e2d7'; -- The User ID you requested
BEGIN
    -- Check if assignment exists
    IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = target_user_id) THEN
        -- Update existing
        UPDATE user_roles 
        SET role = 'super_admin', is_active = true 
        WHERE user_id = target_user_id;
    ELSE
        -- Insert new
        INSERT INTO user_roles (user_id, role, is_active)
        VALUES (target_user_id, 'super_admin', true);
    END IF;
END $$;
