-- Force unlock the user as a super_admin
-- Replace the UUID below if it's different, but this matches the user's log.

INSERT INTO user_roles (user_id, role, is_active)
VALUES ('cd22d408-73b7-4d55-877d-f72a5f00e2d7', 'super_admin', true)
ON CONFLICT (user_id) 
DO UPDATE SET 
    role = 'super_admin', 
    is_active = true;

-- Ensure the 'Users can read own role' policy exists (Just in case part 2 failed)
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
CREATE POLICY "Users can read own role" ON user_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
