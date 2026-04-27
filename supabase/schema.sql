-- ============================================================
-- OMA Digital — Supabase Database Schema
-- ============================================================

-- Leads / Contact Form Submissions
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_type TEXT,
  message TEXT,
  service TEXT,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter Subscriptions
CREATE TABLE IF NOT EXISTS newsletter (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking / Calendar
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  service TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anon key (public forms)
CREATE POLICY "Allow public lead inserts" ON leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public newsletter inserts" ON newsletter FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public newsletter upserts" ON newsletter FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public booking inserts" ON bookings FOR INSERT TO anon WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter(email);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
