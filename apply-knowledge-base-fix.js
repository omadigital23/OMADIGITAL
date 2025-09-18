#!/usr/bin/env node

/**
 * Apply Knowledge Base Fix Migration
 * Adds missing columns to the knowledge_base table
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyKnowledgeBaseFix() {
  console.log('🔧 Applying knowledge_base table fix...');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250117000000_fix_knowledge_base_columns.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      return false;
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Migration file loaded');

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`🔄 Executing ${statements.length} SQL statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`   ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);

      try {
        // Use rpc to execute raw SQL
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';' 
        });

        if (error) {
          console.error(`   ❌ Statement ${i + 1} failed:`, error.message);
          // Continue with other statements
        } else {
          console.log(`   ✅ Statement ${i + 1} executed successfully`);
        }
      } catch (stmtError) {
        console.error(`   ❌ Statement ${i + 1} error:`, stmtError.message);
        // Continue with other statements
      }
    }

    // Verify the fix worked
    console.log('🔍 Verifying table structure...');
    
    const testData = {
      title: 'Test Entry',
      content: 'Test content for verification',
      category: 'test',
      language: 'fr',
      keywords: ['test', 'verification'],
      is_active: true
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('knowledge_base')
      .insert(testData)
      .select('*');

    if (insertError) {
      console.error('❌ Verification failed:', insertError.message);
      return false;
    } else {
      console.log('✅ Table structure verified successfully');
      
      // Clean up test entry
      if (insertResult && insertResult[0]) {
        await supabase
          .from('knowledge_base')
          .delete()
          .eq('id', insertResult[0].id);
        console.log('🧹 Test entry cleaned up');
      }
    }

    console.log('🎉 Knowledge base table fix applied successfully!');
    return true;

  } catch (error) {
    console.error('❌ Fatal error:', error);
    return false;
  }
}

// Run the fix
applyKnowledgeBaseFix().then(success => {
  if (success) {
    console.log('\n✅ Knowledge base fix completed!');
    console.log('📝 You can now run: node scripts/enhanced-knowledge-population.js');
  } else {
    console.log('\n❌ Knowledge base fix failed!');
    console.log('📝 Try running the Supabase migration manually');
    process.exit(1);
  }
});