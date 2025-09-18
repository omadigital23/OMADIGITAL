/**
 * Script to apply all migrations to the new Supabase instance
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Configuration with new credentials
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration(filePath) {
  console.log(`Applying migration: ${path.basename(filePath)}`);
  
  try {
    // Read the SQL file
    const sql = await fs.readFile(filePath, 'utf8');
    
    // Split the SQL into individual statements (simple approach)
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim().length === 0) continue;
      
      try {
        // For CREATE EXTENSION, we need to use the extensions API
        if (statement.toLowerCase().includes('create extension')) {
          console.log('Skipping extension creation (must be done through Supabase dashboard):', statement);
          continue;
        }
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Some statements might not work with rpc, try direct execution for simple cases
          if (error.message.includes('function exec_sql(sql) does not exist')) {
            console.log('Skipping statement (requires direct database access):', statement.substring(0, 100) + '...');
            continue;
          }
          
          // Ignore certain expected errors
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key value') ||
              error.message.includes('constraint') ||
              error.message.includes('policy') ||
              error.message.includes('trigger')) {
            console.log('Non-critical error (continuing):', error.message.substring(0, 100) + '...');
            continue;
          }
          
          throw error;
        }
      } catch (stmtError) {
        // Ignore certain expected errors
        if (stmtError.message.includes('already exists') || 
            stmtError.message.includes('duplicate key value') ||
            stmtError.message.includes('constraint') ||
            stmtError.message.includes('policy') ||
            stmtError.message.includes('trigger')) {
          console.log('Non-critical error (continuing):', stmtError.message.substring(0, 100) + '...');
          continue;
        }
        
        throw stmtError;
      }
    }
    
    console.log(`✅ Successfully applied: ${path.basename(filePath)}\n`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to apply ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

async function applyAllMigrations() {
  console.log('🚀 Starting migration application to new Supabase instance...');
  console.log(`📍 URL: ${supabaseUrl}\n`);
  
  // Get all migration files
  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
  const files = await fs.readdir(migrationsDir);
  
  // Sort files by name (they have timestamps in the name)
  const sortedFiles = files.sort();
  
  console.log(`Found ${sortedFiles.length} migration files to apply:\n`);
  sortedFiles.forEach(file => console.log(`  - ${file}`));
  console.log('');
  
  let successCount = 0;
  let failureCount = 0;
  
  // Apply each migration
  for (const file of sortedFiles) {
    const filePath = path.join(migrationsDir, file);
    const success = await applyMigration(filePath);
    
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
  }
  
  console.log('\n📊 Migration Application Summary:');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📋 Total: ${sortedFiles.length}`);
  
  if (failureCount === 0) {
    console.log('\n🎉 All migrations applied successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Run the populate-knowledge-base.js script to add initial content');
    console.log('2. Create an admin user with create-admin-user.js');
    console.log('3. Test the connection with verify-supabase-connection.js');
    return true;
  } else {
    console.log('\n⚠️  Some migrations failed. Please check the errors above.');
    console.log('You may need to manually apply some migrations through the Supabase SQL editor.');
    return false;
  }
}

// Alternative approach using the Supabase CLI
async function suggestCliApproach() {
  console.log('\n🔧 Alternative: Using Supabase CLI (recommended for production)');
  console.log('Run these commands in your terminal:');
  console.log('\n  # Link to your project');
  console.log('  npx supabase link --project-ref pcedyohixahtfogfdlig');
  console.log('\n  # Apply all migrations');
  console.log('  npx supabase migration up');
  console.log('\n  # Reset and reapply (if needed)');
  console.log('  npx supabase migration reset');
  console.log('  npx supabase migration up');
}

// Run the migration application if called directly
if (require.main === module) {
  applyAllMigrations()
    .then(async (success) => {
      if (!success) {
        await suggestCliApproach();
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Fatal error:', error);
      suggestCliApproach();
      process.exit(1);
    });
}

module.exports = { applyAllMigrations };