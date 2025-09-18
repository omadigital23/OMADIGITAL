const { createClient } = require('@supabase/supabase-js');

// Configuration using service role key for full access
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZXdwbGt2cHJ0cmxzcnZlZ3BsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI1MDg0NywiZXhwIjoyMDcxODI2ODQ3fQ.TSp2sDDbcB8so74xwwwlJjBT9oRt4_htiCM02wZFV_8';

const supabase = createClient(supabaseUrl, supabaseKey);

// The correct schema for the knowledge_base table
const knowledgeBaseSchema = `
  ALTER TABLE knowledge_base 
  ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS language VARCHAR(2) NOT NULL CHECK (language IN ('fr', 'en')) DEFAULT 'fr',
  ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS embedding vector(1536),
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
`;

// Alternative approach: Drop and recreate the table with correct schema
const recreateTableSQL = `
  DROP TABLE IF EXISTS knowledge_base CASCADE;
  
  CREATE TABLE knowledge_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    language VARCHAR(2) NOT NULL CHECK (language IN ('fr', 'en')),
    keywords TEXT[],
    embedding vector(1536),
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Indexes
  CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
  CREATE INDEX IF NOT EXISTS idx_knowledge_base_language ON knowledge_base(language);
  CREATE INDEX IF NOT EXISTS idx_knowledge_base_active ON knowledge_base(is_active);
  CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops);
  
  -- Function for updated_at
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ language 'plpgsql';
  
  -- Trigger
  CREATE TRIGGER update_knowledge_base_updated_at 
  BEFORE UPDATE ON knowledge_base 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
  
  -- RLS
  ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
  
  -- Policies
  CREATE POLICY "Allow public read access to knowledge_base" 
  ON knowledge_base 
  FOR SELECT 
  USING (is_active = true);
  
  CREATE POLICY "Allow admin access to knowledge_base" 
  ON knowledge_base 
  FOR ALL TO authenticated 
  USING (true);
`;

async function fixKnowledgeBaseSchema() {
  console.log('🔧 Attempting to fix knowledge_base table schema...\n');

  try {
    console.log('🧪 Testing current table structure...');
    
    // Test if we can access the title column
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('title')
      .limit(1);

    if (error && error.message.includes('column knowledge_base.title does not exist')) {
      console.log('❌ Confirmed: Schema cache issue exists');
      console.log('🔧 Attempting to fix by applying correct schema...');
      
      // Note: We cannot directly execute DDL statements through the Supabase JS client
      // We need to use the Supabase SQL editor or CLI for this
      console.log('\n⚠️ Cannot directly apply schema changes through JS client');
      console.log('🔧 Recommended steps:');
      console.log('1. Go to Supabase Dashboard > SQL Editor');
      console.log('2. Run the following SQL to fix the table schema:');
      console.log('\n--- SQL TO RUN IN SUPABASE DASHBOARD ---');
      console.log(recreateTableSQL);
      console.log('--- END SQL ---\n');
      
      console.log('Alternatively, if you prefer to keep existing data:');
      console.log('1. Go to Supabase Dashboard > Table Editor');
      console.log('2. Check the knowledge_base table structure');
      console.log('3. Add missing columns manually:');
      console.log('   - title (TEXT, NOT NULL)');
      console.log('   - category (VARCHAR(50), NOT NULL)');
      console.log('   - language (VARCHAR(2), NOT NULL, with check constraint)');
      console.log('   - keywords (TEXT[])');
      console.log('   - embedding (vector(1536))');
      console.log('   - metadata (JSONB)');
      console.log('   - is_active (BOOLEAN)');
      console.log('   - updated_at (TIMESTAMP WITH TIME ZONE)');
      
      return false;
    } else if (error) {
      console.log('❌ Unexpected error:', error.message);
      return false;
    } else {
      console.log('✅ Table schema appears to be correct');
      return true;
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Run the fix attempt
fixKnowledgeBaseSchema().then(success => {
  if (!success) {
    console.log('\n⚠️ Manual intervention required to fix the schema cache issue.');
    console.log('Please follow the instructions above to update the table schema in the Supabase dashboard.');
    process.exit(1);
  } else {
    console.log('\n✅ Knowledge base schema is correct!');
  }
});