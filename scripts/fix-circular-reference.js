#!/usr/bin/env node

/**
 * Direct Fix for Circular Reference Issues
 * This script directly addresses the "infinite recursion detected in policy for relation 'admin_users'" error
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

class CircularReferenceFix {
  constructor() {
    // Initialize Supabase client
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async checkConnection() {
    try {
      // Simple query to test connection
      const { data, error } = await this.supabase
        .from('admin_users')
        .select('*')
        .limit(1);
      
      if (error) {
        // If the table doesn't exist, that's okay for now
        if (error.message.includes('does not exist')) {
          this.log('✅ Database connection verified (table may not exist yet)', 'success');
          return true;
        }
        throw error;
      }
      
      this.log('✅ Database connection verified', 'success');
      return true;
    } catch (error) {
      this.log(`❌ Database connection failed: ${error.message}`, 'error');
      return false;
    }
  }

  async executeSQL(sql) {
    try {
      const { error } = await this.supabase.rpc('exec_sql', { sql });
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async fixCircularReferences() {
    this.log('🔧 Starting circular reference fix...', 'info');
    
    // Step 1: Drop the problematic is_admin_user function if it exists
    this.log('🗑️  Removing is_admin_user function if it exists...', 'info');
    const dropFunctionResult = await this.executeSQL(`
      DROP FUNCTION IF EXISTS is_admin_user() CASCADE;
    `);
    
    if (dropFunctionResult.success) {
      this.log('✅ Successfully dropped is_admin_user function', 'success');
    } else {
      this.log(`⚠️  Warning when dropping function: ${dropFunctionResult.error}`, 'warning');
    }
    
    // Step 2: Drop all existing policies on admin_users table
    this.log('🗑️  Removing existing policies on admin_users table...', 'info');
    const policiesToRemove = [
      'Allow admin access to admin_users',
      'Allow admin full access to admin_users',
      'Allow select own roles',
      'Allow admin writes',
      'Allow selects for admins',
      'Admin users full access',
      'Admin users read access'
    ];
    
    for (const policyName of policiesToRemove) {
      const result = await this.executeSQL(`
        DROP POLICY IF EXISTS "${policyName}" ON admin_users;
      `);
      
      if (result.success) {
        this.log(`✅ Dropped policy: ${policyName}`, 'success');
      } else {
        this.log(`⚠️  Warning when dropping policy ${policyName}: ${result.error}`, 'warning');
      }
    }
    
    // Step 3: Create new simple policies for admin_users
    this.log('➕ Creating new simple policies for admin_users...', 'info');
    
    const newPolicies = [
      `CREATE POLICY "Admin users full access" ON admin_users 
        FOR ALL TO authenticated 
        USING ((auth.jwt() ->> 'role') = 'admin')
        WITH CHECK ((auth.jwt() ->> 'role') = 'admin');`,
      
      `CREATE POLICY "Admin users read access" ON admin_users 
        FOR SELECT TO authenticated 
        USING ((auth.jwt() ->> 'role') = 'admin' OR id = auth.uid());`
    ];
    
    for (let i = 0; i < newPolicies.length; i++) {
      const result = await this.executeSQL(newPolicies[i]);
      
      if (result.success) {
        this.log(`✅ Created policy ${i + 1}/${newPolicies.length}`, 'success');
      } else {
        this.log(`❌ Failed to create policy: ${result.error}`, 'error');
        return false;
      }
    }
    
    // Step 4: Fix conversations table policies
    this.log('➕ Fixing conversations table policies...', 'info');
    
    const conversationPolicies = [
      `DROP POLICY IF EXISTS "Allow admin access to conversations" ON conversations;`,
      `DROP POLICY IF EXISTS "Allow admin full access to conversations" ON conversations;`,
      `DROP POLICY IF EXISTS "Allow public access to conversations" ON conversations;`,
      `DROP POLICY IF EXISTS "Allow public insert to conversations" ON conversations;`,
      `DROP POLICY IF EXISTS "Allow select own conversations" ON conversations;`,
      `DROP POLICY IF EXISTS "Conversations public insert" ON conversations;`,
      `DROP POLICY IF EXISTS "Conversations select own" ON conversations;`,
      `DROP POLICY IF EXISTS "Conversations admin access" ON conversations;`,
      
      `CREATE POLICY "Conversations public insert" ON conversations 
        FOR INSERT WITH CHECK (true);`,
        
      `CREATE POLICY "Conversations select own" ON conversations 
        FOR SELECT USING (
          user_id = auth.uid() OR 
          session_id = current_setting('request.headers', true)::json->>'x-session-id'
        );`,
        
      `CREATE POLICY "Conversations admin access" ON conversations 
        FOR ALL TO authenticated 
        USING ((auth.jwt() ->> 'role') = 'admin');`
    ];
    
    for (let i = 0; i < conversationPolicies.length; i++) {
      const result = await this.executeSQL(conversationPolicies[i]);
      
      if (result.success) {
        this.log(`✅ Applied conversation policy ${i + 1}/${conversationPolicies.length}`, 'success');
      } else {
        this.log(`⚠️  Warning for conversation policy ${i + 1}: ${result.error}`, 'warning');
      }
    }
    
    // Step 5: Fix messages table policies
    this.log('➕ Fixing messages table policies...', 'info');
    
    const messagePolicies = [
      `DROP POLICY IF EXISTS "Allow admin access to messages" ON messages;`,
      `DROP POLICY IF EXISTS "Allow admin full access to messages" ON messages;`,
      `DROP POLICY IF EXISTS "Allow public access to messages" ON messages;`,
      `DROP POLICY IF EXISTS "Allow insert to messages" ON messages;`,
      `DROP POLICY IF EXISTS "Allow select conversation messages" ON messages;`,
      `DROP POLICY IF EXISTS "Messages public insert" ON messages;`,
      `DROP POLICY IF EXISTS "Messages admin access" ON messages;`,
      
      `CREATE POLICY "Messages public insert" ON messages 
        FOR INSERT WITH CHECK (true);`,
        
      `CREATE POLICY "Messages admin access" ON messages 
        FOR ALL TO authenticated 
        USING ((auth.jwt() ->> 'role') = 'admin');`
    ];
    
    for (let i = 0; i < messagePolicies.length; i++) {
      const result = await this.executeSQL(messagePolicies[i]);
      
      if (result.success) {
        this.log(`✅ Applied message policy ${i + 1}/${messagePolicies.length}`, 'success');
      } else {
        this.log(`⚠️  Warning for message policy ${i + 1}: ${result.error}`, 'warning');
      }
    }
    
    this.log('✅ Circular reference fix completed!', 'success');
    return true;
  }

  async run() {
    try {
      this.log('🚀 Starting circular reference fix process...', 'info');
      
      // Check database connection
      const connected = await this.checkConnection();
      if (!connected) {
        throw new Error('Cannot connect to database');
      }
      
      // Apply the fixes
      const success = await this.fixCircularReferences();
      
      if (success) {
        this.log('\n🎉 Circular reference issues have been fixed!', 'success');
        this.log('💡 You should now be able to query the admin_users table without recursion errors', 'info');
        return true;
      } else {
        this.log('\n❌ Failed to fix circular reference issues', 'error');
        return false;
      }
      
    } catch (error) {
      this.log(`\n❌ Process failed: ${error.message}`, 'error');
      return false;
    }
  }
}

// Add to package.json scripts
// "fix:circular": "node scripts/fix-circular-reference.js"

// Run if called directly
if (require.main === module) {
  const fixer = new CircularReferenceFix();
  fixer.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = CircularReferenceFix;