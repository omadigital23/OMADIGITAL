-- Create user_roles table for admin access control
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Add RLS policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Allow selects for admins only (simplified to avoid recursion)
CREATE POLICY "Allow selects for admins" ON user_roles 
FOR SELECT USING (
  -- Check if current user is an admin using auth.jwt() to avoid recursion
  COALESCE(auth.jwt() ->> 'role', '') = 'admin' OR
  -- Allow users to see their own roles
  user_id = auth.uid()
);

-- Allow inserts and updates for admins only
CREATE POLICY "Allow admin writes" ON user_roles 
FOR ALL USING (
  COALESCE(auth.jwt() ->> 'role', '') = 'admin'
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_roles TO authenticated;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user role (you'll need to replace 'your-admin-user-id' with the actual user ID)
-- INSERT INTO user_roles (user_id, role) VALUES ('your-admin-user-id', 'admin') 
-- ON CONFLICT DO NOTHING;