-- 1. Create the new column is_active
ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Migrate existing 'admin' usage to 'super_admin' to ensure continuity
-- We assume current 'admin' users should become 'super_admin'
UPDATE user_roles 
SET role = 'super_admin' 
WHERE role = 'admin';

-- 3. Update the Check Constraint for roles
-- First drop existing constraint if named predictably, or just add a valid check
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- We include 'user' and 'moderator' to support legacy/other parts of the app, 
-- but strictly enforce 'super_admin' and 'humanitarian_admin' for admin panel logic.
ALTER TABLE user_roles 
ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('super_admin', 'humanitarian_admin', 'user', 'moderator', 'admin')); -- kept 'admin' temporarily to avoid breakage if I missed something, but ideally we remove it.

-- 4. RLS Policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop generic policies if they exist (names might vary, this is best effort)
DROP POLICY IF EXISTS "Enable read access for all users" ON user_roles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_roles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON user_roles;

-- Policy: Users can read their own role (Critical for App startup)
CREATE POLICY "Users can read own role" ON user_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Super Admins can manage all roles
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
