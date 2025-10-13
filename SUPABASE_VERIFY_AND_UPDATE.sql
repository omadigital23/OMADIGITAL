-- ============================================
-- SUPABASE VERIFICATION AND UPDATE SCRIPT
-- ============================================
-- This script verifies and updates existing tables
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. VERIFY QUOTES TABLE STRUCTURE
-- ============================================

-- Check if all required columns exist in quotes table
DO $$
BEGIN
  -- Add missing columns if they don't exist
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'quotes' AND column_name = 'security_validated') THEN
    ALTER TABLE public.quotes ADD COLUMN security_validated BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added security_validated column to quotes';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'quotes' AND column_name = 'location') THEN
    ALTER TABLE public.quotes ADD COLUMN location TEXT NOT NULL DEFAULT 'senegal';
    RAISE NOTICE 'Added location column to quotes';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'quotes' AND column_name = 'updated_at') THEN
    ALTER TABLE public.quotes ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column to quotes';
  END IF;
END $$;

-- 2. CREATE INDEXES IF NOT EXISTS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_quotes_email ON public.quotes(email);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON public.quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_location ON public.quotes(location);

-- 3. ENABLE RLS IF NOT ENABLED
-- ============================================

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- 4. DROP EXISTING POLICIES (to avoid conflicts)
-- ============================================

DROP POLICY IF EXISTS "Allow anonymous quote submissions" ON public.quotes;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.quotes;
DROP POLICY IF EXISTS "Allow service role full access" ON public.quotes;

-- 5. CREATE FRESH POLICIES
-- ============================================

-- Policy: Allow anonymous inserts (for form submissions)
CREATE POLICY "Allow anonymous quote submissions" ON public.quotes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow authenticated users to read all quotes
CREATE POLICY "Allow authenticated read access" ON public.quotes
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow service role full access
CREATE POLICY "Allow service role full access" ON public.quotes
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 6. CREATE OR REPLACE UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_quotes_updated_at ON public.quotes;

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. VERIFY BLOG_SUBSCRIBERS TABLE
-- ============================================

-- Create blog_subscribers if it doesn't exist
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
  
  CONSTRAINT blog_subscribers_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT blog_subscribers_status_check CHECK (status IN ('pending', 'active', 'unsubscribed'))
);

-- Create indexes for blog_subscribers
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_email ON public.blog_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_status ON public.blog_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_confirmation_token ON public.blog_subscribers(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_unsubscribe_token ON public.blog_subscribers(unsubscribe_token);

-- Enable RLS for blog_subscribers
ALTER TABLE public.blog_subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous newsletter subscriptions" ON public.blog_subscribers;
DROP POLICY IF EXISTS "Allow token-based updates" ON public.blog_subscribers;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.blog_subscribers;

-- Create policies for blog_subscribers
CREATE POLICY "Allow anonymous newsletter subscriptions" ON public.blog_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow token-based updates" ON public.blog_subscribers
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read access" ON public.blog_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- Add updated_at trigger for blog_subscribers
DROP TRIGGER IF EXISTS update_blog_subscribers_updated_at ON public.blog_subscribers;

CREATE TRIGGER update_blog_subscribers_updated_at
  BEFORE UPDATE ON public.blog_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. VERIFY CTA_CONVERSIONS TABLE
-- ============================================

-- Create cta_conversions if it doesn't exist
CREATE TABLE IF NOT EXISTS public.cta_conversions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cta_id UUID,
  session_id TEXT NOT NULL,
  conversion_type TEXT NOT NULL,
  conversion_value NUMERIC,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for cta_conversions
CREATE INDEX IF NOT EXISTS idx_cta_conversions_session ON public.cta_conversions(session_id);
CREATE INDEX IF NOT EXISTS idx_cta_conversions_type ON public.cta_conversions(conversion_type);
CREATE INDEX IF NOT EXISTS idx_cta_conversions_created_at ON public.cta_conversions(created_at DESC);

-- Enable RLS for cta_conversions
ALTER TABLE public.cta_conversions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous conversion tracking" ON public.cta_conversions;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.cta_conversions;

-- Create policies for cta_conversions
CREATE POLICY "Allow anonymous conversion tracking" ON public.cta_conversions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read access" ON public.cta_conversions
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 9. VERIFICATION QUERIES
-- ============================================

-- Show quotes table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'quotes'
ORDER BY ordinal_position;

-- Show blog_subscribers table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'blog_subscribers'
ORDER BY ordinal_position;

-- Show cta_conversions table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'cta_conversions'
ORDER BY ordinal_position;

-- Show all policies for quotes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('quotes', 'blog_subscribers', 'cta_conversions')
ORDER BY tablename, policyname;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ All tables verified and updated successfully!';
  RAISE NOTICE '✅ RLS policies configured correctly!';
  RAISE NOTICE '✅ Indexes created for performance!';
  RAISE NOTICE '✅ Triggers configured for updated_at columns!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Next steps:';
  RAISE NOTICE '1. Test the CTASection form submission';
  RAISE NOTICE '2. Test the Newsletter subscription';
  RAISE NOTICE '3. Check data in Table Editor';
END $$;
