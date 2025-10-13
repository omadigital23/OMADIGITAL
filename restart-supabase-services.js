#!/usr/bin/env node

/**
 * Script to restart Supabase services and refresh schema cache
 * This helps resolve schema cache issues
 */

const { exec } = require('child_process');
const path = require('path');

// Change to project directory
const projectDir = path.resolve(__dirname);
console.log('🔧 Working in directory:', projectDir);

// Function to execute command with promise
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔧 Executing: ${command}`);
    exec(command, { cwd: projectDir }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.log(`⚠️ Stderr: ${stderr}`);
      }
      console.log(`✅ Output: ${stdout}`);
      resolve(stdout);
    });
  });
}

async function restartSupabaseServices() {
  try {
    console.log('🔄 Restarting Supabase services to refresh schema cache...\n');
    
    // Check if Supabase is running
    try {
      await executeCommand('npx supabase status');
    } catch (error) {
      console.log('⚠️ Supabase is not currently running');
    }
    
    // Stop Supabase services
    console.log('\n🛑 Stopping Supabase services...');
    try {
      await executeCommand('npx supabase stop');
    } catch (error) {
      console.log('⚠️ Supabase stop command failed, continuing...');
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start Supabase services
    console.log('\n🚀 Starting Supabase services...');
    await executeCommand('npx supabase start');
    
    // Wait for services to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Link to remote project to refresh schema cache
    console.log('\n🔗 Linking to remote project to refresh schema cache...');
    try {
      await executeCommand('npx supabase link --project-ref osewplkvprtrlsrvegpl');
    } catch (error) {
      console.log('⚠️ Link command failed, but services should still be running');
    }
    
    // Apply migrations
    console.log('\n📋 Applying database migrations...');
    try {
      await executeCommand('npx supabase migration up');
    } catch (error) {
      console.log('⚠️ Migration command failed, but services should still be running');
    }
    
    console.log('\n🎉 Supabase services restart process completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Test the knowledge base access with: node test-knowledge-base-access.js');
    console.log('2. Verify the chatbot functionality');
    console.log('3. If issues persist, check the Supabase logs: npx supabase logs');
    
  } catch (error) {
    console.error('\n❌ Error during execution:', error.message);
    process.exit(1);
  }
}

// Run the restart process
restartSupabaseServices();