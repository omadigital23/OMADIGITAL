-- Conversions tracking table
CREATE TABLE IF NOT EXISTS conversions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'quote_request', 'contact_click', 'demo_request'
  session_id VARCHAR(255),
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_conversions_type ON conversions(type);
CREATE INDEX IF NOT EXISTS idx_conversions_created_at ON conversions(created_at);

-- RLS Policy
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for authenticated users" ON conversions FOR ALL USING (true);