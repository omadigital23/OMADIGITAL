// Script to apply the blog_subscribers schema fix
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase from the verify script
const projectId = 'pcedyohixahtfogfdlig';
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

const supabase = createClient(supabaseUrl, supabaseKey);

// SQL for fixing the blog_subscribers table schema
const fixBlogSubscribersSchemaSQL = `
-- Fix blog_subscribers table schema to match API expectations

-- Add confirmed_at column if it doesn't exist
ALTER TABLE blog_subscribers ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Remove the old confirmed column if it exists
ALTER TABLE blog_subscribers DROP COLUMN IF EXISTS confirmed;

-- Add comment for clarity
COMMENT ON COLUMN blog_subscribers.confirmed_at IS 'Timestamp when the subscriber confirmed their email address';
`;

async function applyFix() {
  try {
    console.log('Applying blog_subscribers schema fix...');
    
    // Execute the SQL statement
    const { error } = await supabase.rpc('exec_sql', { sql: fixBlogSubscribersSchemaSQL });
    
    if (error) {
      console.error('Error applying schema fix:', error);
      return false;
    }
    
    console.log('✅ Blog_subscribers schema fix applied successfully!');
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

// Run the fix
applyFix()
  .then(success => {
    if (success) {
      console.log('🎉 Blog_subscribers schema fix completed successfully!');
    } else {
      console.log('💥 Blog_subscribers schema fix failed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });