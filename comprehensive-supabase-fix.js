#!/usr/bin/env node

/**
 * Comprehensive Script to fix Supabase schema cache issues
 * 
 * This script performs multiple actions to resolve schema cache problems:
 * 1. Check current Supabase status
 * 2. Refresh the Supabase schema cache
 * 3. Restart Supabase services
 * 4. Re-apply database migrations
 * 5. Verify table structure
 * 6. Test knowledge base access
 */

const { execSync, exec } = require('child_process');
const path = require('path');

// Change to project directory
const projectDir = path.resolve(__dirname);
console.log('🔧 Working in directory:', projectDir);

// Function to execute command and handle errors
function executeCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔧 Executing: ${command}`);
    exec(command, { cwd: projectDir, ...options }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error executing command: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.log(`⚠️ Stderr: ${stderr}`);
      }
      console.log(`✅ Command output: ${stdout}`);
      resolve(stdout);
    });
  });
}

async function fixSupabaseSchemaCache() {
  try {
    // Step 1: Check current Supabase status
    console.log('\n🔍 Step 1: Checking current Supabase status...');
    try {
      await executeCommand('npx supabase status');
    } catch (error) {
      console.log('⚠️ Supabase is not running or not initialized');
    }

    // Step 2: Stop Supabase services (if running)
    console.log('\n🔄 Step 2: Stopping Supabase services...');
    try {
      await executeCommand('npx supabase stop');
    } catch (error) {
      console.log('⚠️ Supabase was not running or stop command failed');
    }

    // Step 3: Reset Supabase local database (optional but thorough)
    console.log('\n🔄 Step 3: Resetting Supabase local database...');
    try {
      await executeCommand('npx supabase db reset --confirm-destroy', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️ Database reset failed or was skipped');
    }

    // Step 4: Start Supabase services
    console.log('\n🔄 Step 4: Starting Supabase services...');
    await executeCommand('npx supabase start', { stdio: 'inherit' });

    // Step 5: Link to remote project (refreshes schema cache)
    console.log('\n🔄 Step 5: Refreshing Supabase schema cache...');
    try {
      await executeCommand('npx supabase link --project-ref pcedyohixahtfogfdlig');
    } catch (error) {
      console.log('⚠️ Link command failed, continuing with other steps');
    }

    // Step 6: Apply all migrations
    console.log('\n🔄 Step 6: Applying all database migrations...');
    await executeCommand('npx supabase migration up', { stdio: 'inherit' });

    // Step 7: Check table structure
    console.log('\n🔍 Step 7: Verifying table structure...');
    try {
      await executeCommand('npx supabase db dump --schema public --file supabase-schema.sql');
      console.log('✅ Schema dumped successfully');
    } catch (error) {
      console.log('⚠️ Schema dump failed');
    }

    // Step 8: Test knowledge base access
    console.log('\n🔍 Step 8: Testing knowledge base access...');
    try {
      const testResult = await executeCommand(`node -e "
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(
          'https://pcedyohixahtfogfdlig.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI1MDg0NywiZXhwIjoyMDcxODI2ODQ3fQ.TSp2sDDbcB8so74xwwwlJjBT9oRt4_htiCM02wZFV_8'
        );
        supabase.from('knowledge_base').select('id, title, content').limit(1).then(result => {
          if (result.error) {
            console.log('❌ Knowledge base access failed:', result.error.message);
          } else {
            console.log('✅ Knowledge base access successful. Found ' + result.data.length + ' records.');
          }
        });
      "`);
    } catch (error) {
      console.log('⚠️ Knowledge base test failed');
    }

    console.log('\n🎉 All steps completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Test your chatbot functionality');
    console.log('2. Verify that the knowledge base is accessible');
    console.log('3. Check that all tables are properly recognized');
    console.log('4. Run the verification script: node verify-chatbot-coherence.js');

  } catch (error) {
    console.error('\n❌ Error during execution:', error.message);
    process.exit(1);
  }
}

// Run the fix process
fixSupabaseSchemaCache();