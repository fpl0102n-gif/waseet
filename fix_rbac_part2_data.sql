-- Part 2: Update Data & Policies
-- Run this script SECOND, after fix_rbac_part1_enums.sql is successful.

-- 1. Add is_active column if missing
ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Migrate data 
-- (This requires the enums from Part 1 to be committed)
UPDATE user_roles 
SET role = 'super_admin' 
WHERE role = 'admin';

-- 3. Update Policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
DROP POLICY IF EXISTS "Super Admins can manage all" ON user_roles;

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
