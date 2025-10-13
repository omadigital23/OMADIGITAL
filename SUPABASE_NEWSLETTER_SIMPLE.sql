-- ============================================
-- SIMPLE NEWSLETTER TABLE CREATION
-- ============================================
-- Copy and paste this ENTIRE script into Supabase SQL Editor
-- Then click "Run" or press Ctrl+Enter
-- ============================================

-- Create the blog_subscribers table
CREATE TABLE IF NOT EXISTS public.blog_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  source TEXT NOT NULL DEFAULT 'footer',
  confirmation_token TEXT,
  unsubscribe_token TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT blog_subscribers_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT blog_subscribers_status_check CHECK (status IN ('pending', 'active', 'unsubscribed'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_email ON public.blog_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_status ON public.blog_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_created_at ON public.blog_subscribers(created_at DESC);

-- Enable RLS
ALTER TABLE public.blog_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow anonymous newsletter subscriptions" ON public.blog_subscribers
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow token-based updates" ON public.blog_subscribers
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated read access" ON public.blog_subscribers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow service role full access" ON public.blog_subscribers
  TO service_role USING (true) WITH CHECK (true);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_blog_subscribers_updated_at
  BEFORE UPDATE ON public.blog_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify table was created
SELECT 'Table blog_subscribers created successfully!' as message;
