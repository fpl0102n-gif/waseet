-- Fix for ENUM Error: explicitly add new values to app_role type
-- run these lines carefully.

-- 1. Add new enum values
-- Note: These must not be inside a transaction block in some Postgres contexts.
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'humanitarian_admin';

-- 2. Add is_active column if missing
ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. Migrate data
-- Now that 'super_admin' is a valid enum value, this will work.
UPDATE user_roles 
SET role = 'super_admin' 
WHERE role = 'admin';

-- 4. Re-apply Policies
-- (We re-run this to ensure they use the new data correctly)
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
