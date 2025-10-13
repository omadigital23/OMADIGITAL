-- ============================================
-- NEWSLETTER TABLE SETUP
-- ============================================
-- This script creates and configures the blog_subscribers table
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. DROP EXISTING TABLE (OPTIONAL - UNCOMMENT IF YOU WANT A FRESH START)
-- ============================================
-- WARNING: This will delete all existing newsletter subscribers!
-- DROP TABLE IF EXISTS public.blog_subscribers CASCADE;

-- 2. CREATE BLOG_SUBSCRIBERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.blog_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  source TEXT NOT NULL DEFAULT 'footer',
  confirmation_token TEXT,
  unsubscribe_token TEXT NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT blog_subscribers_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT blog_subscribers_status_check CHECK (status IN ('pending', 'active', 'unsubscribed'))
);

-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_blog_subscribers_email ON public.blog_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_status ON public.blog_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_confirmation_token ON public.blog_subscribers(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_unsubscribe_token ON public.blog_subscribers(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_created_at ON public.blog_subscribers(created_at DESC);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.blog_subscribers ENABLE ROW LEVEL SECURITY;

-- 5. DROP EXISTING POLICIES (to avoid conflicts)
-- ============================================

DROP POLICY IF EXISTS "Allow anonymous newsletter subscriptions" ON public.blog_subscribers;
DROP POLICY IF EXISTS "Allow token-based updates" ON public.blog_subscribers;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.blog_subscribers;
DROP POLICY IF EXISTS "Allow service role full access" ON public.blog_subscribers;

-- 6. CREATE RLS POLICIES
-- ============================================

-- Policy: Allow anonymous inserts (for newsletter subscriptions)
CREATE POLICY "Allow anonymous newsletter subscriptions" ON public.blog_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow anonymous updates (for confirmation and unsubscribe)
CREATE POLICY "Allow token-based updates" ON public.blog_subscribers
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to read all subscribers
CREATE POLICY "Allow authenticated read access" ON public.blog_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow service role full access
CREATE POLICY "Allow service role full access" ON public.blog_subscribers
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 7. CREATE UPDATED_AT TRIGGER
-- ============================================

-- Create or replace the trigger function (if not already exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_blog_subscribers_updated_at ON public.blog_subscribers;

-- Create the trigger
CREATE TRIGGER update_blog_subscribers_updated_at
  BEFORE UPDATE ON public.blog_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. FIX EXISTING DATA (if table already exists)
-- ============================================

-- Ensure id column has UUID default (if it doesn't)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'blog_subscribers' AND column_name = 'id' AND column_default IS NULL) THEN
    ALTER TABLE public.blog_subscribers ALTER COLUMN id SET DEFAULT gen_random_uuid();
    RAISE NOTICE 'Set default UUID generation for id column in blog_subscribers';
  END IF;
END $$;

-- 9. VERIFICATION QUERIES
-- ============================================

-- Show table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'blog_subscribers'
ORDER BY ordinal_position;

-- Show all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'blog_subscribers'
ORDER BY policyname;

-- Count existing subscribers
SELECT 
  status,
  COUNT(*) as count
FROM public.blog_subscribers
GROUP BY status;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Newsletter table (blog_subscribers) configured successfully!';
  RAISE NOTICE '✅ RLS policies configured correctly!';
  RAISE NOTICE '✅ Indexes created for performance!';
  RAISE NOTICE '✅ Triggers configured for updated_at column!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Next steps:';
  RAISE NOTICE '1. Test the newsletter subscription form in the footer';
  RAISE NOTICE '2. Check data in Table Editor';
  RAISE NOTICE '3. Verify confirmation emails are sent (check logs)';
END $$;
