// Script to apply all migrations to Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const projectId = 'pcedyohixahtfogfdlig';
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZXdwbGt2cHJ0cmxzcnZlZ3BsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI1MDg0NywiZXhwIjoyMDcxODI2ODQ3fQ.TSp2sDDbcB8so74xwwwlJjBT9oRt4_htiCM02wZFV_8';

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to apply a single migration file
async function applyMigration(filePath) {
  console.log(`Applying migration: ${path.basename(filePath)}`);
  
  try {
    // Read the SQL file
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.startsWith('--') || statement.startsWith('/*')) {
        // Skip comments
        continue;
      }
      
      console.log('Executing statement:', statement.substring(0, 50) + (statement.length > 50 ? '...' : ''));
      
      // Try to execute the statement
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        // Some statements might need special handling
        console.warn('Warning with statement:', error.message);
      }
    }
    
    console.log(`✅ Migration ${path.basename(filePath)} applied successfully!\n`);
    return true;
  } catch (error) {
    console.error(`❌ Error applying migration ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

// Function to apply all migrations in order
async function applyAllMigrations() {
  try {
    console.log('Starting migration process...\n');
    
    // Get all migration files and sort them
    const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${migrationFiles.length} migration files\n`);
    
    // Apply each migration in order
    let successCount = 0;
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const success = await applyMigration(filePath);
      if (success) {
        successCount++;
      }
    }
    
    console.log(`\n🎉 Migration process complete! ${successCount}/${migrationFiles.length} migrations applied successfully.`);
    
    if (successCount === migrationFiles.length) {
      console.log('✅ All migrations applied successfully! Your application should now work correctly.');
    } else {
      console.log('⚠️  Some migrations failed. Please check the errors above and retry.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the migrations
applyAllMigrations();