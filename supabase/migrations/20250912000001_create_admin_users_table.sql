-- Create admin_users table for secure admin authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Add RLS policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow selects for admins only
CREATE POLICY "Allow admin access to admin_users" ON admin_users 
FOR ALL USING (
  -- Check if current user is an admin using auth.jwt() to avoid recursion
  COALESCE(auth.jwt() ->> 'role', '') = 'admin' OR
  -- Allow users to see their own record
  id = auth.uid()
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_users TO authenticated;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_admin_users_updated_at();

-- Insert default admin user (using existing credentials)
-- Note: In production, this should be done through a secure setup process
INSERT INTO admin_users (username, email, password_hash, salt, role, first_name, last_name, is_active)
VALUES (
  'admin_dca740c1',
  'admin@omadigital.com',
  'd90485b33a0a7c8b63714e4a7d8341514e3b653813142d0a1943215873210987210485b33a0a7c8b63714e4a7d8341514e3b653813142d0a1943215873210987',
  '7a1b8e3f4c2a9d5e1f0a6b4c8d3e7f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e',
  'admin',
  'Administrateur',
  'Principal',
  true
)
ON CONFLICT (username) DO NOTHING;