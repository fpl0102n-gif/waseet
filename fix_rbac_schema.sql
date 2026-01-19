-- Fix for RBAC Schema: Missing is_active column and updated roles

-- 1. Add is_active column if it doesn't exist
ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Migrate old 'admin' roles to 'super_admin'
UPDATE user_roles 
SET role = 'super_admin' 
WHERE role = 'admin';

-- 3. Update the role constraint
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE user_roles 
ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('super_admin', 'humanitarian_admin', 'user', 'moderator', 'admin'));

-- 4. Ensure RLS policies exist
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop old policies to refresh
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
DROP POLICY IF EXISTS "Super Admins can manage all" ON user_roles;

-- Re-create policies
CREATE POLICY "Users can read own role" ON user_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Super Admins can manage all" ON user_roles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'super_admin'
            AND ur.is_active = true
        )
    );
