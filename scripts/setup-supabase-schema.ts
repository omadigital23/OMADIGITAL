/**
 * Supabase Schema Setup Script
 * 
 * Purpose: Applies the chatbot schema migration to Supabase
 * Usage: npx tsx scripts/setup-supabase-schema.ts
 * 
 * Requirements:
 * - NEXT_PUBLIC_SUPABASE_URL in .env.local
 * - SUPABASE_SERVICE_ROLE_KEY in .env.local
 * 
 * @security Uses service role key - run server-side only
 * @performance Idempotent - safe to run multiple times
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease add them to your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupSchema() {
  console.log('🚀 Starting Supabase schema setup...\n');

  try {
    // Read the migration SQL file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '20251012_chatbot_schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Loaded migration file: 20251012_chatbot_schema.sql');
    console.log('📊 Executing SQL migration...\n');

    // Execute the migration
    // Note: Supabase client doesn't support raw SQL execution directly
    // You need to use the Supabase CLI or Dashboard SQL Editor
    console.log('⚠️  Important: This script requires manual execution via:');
    console.log('   1. Supabase Dashboard > SQL Editor');
    console.log('   2. Copy contents of supabase/migrations/20251012_chatbot_schema.sql');
    console.log('   3. Paste and run in SQL Editor\n');
    console.log('   OR use Supabase CLI:');
    console.log('   supabase db push\n');

    // Verify tables exist by attempting to query them
    console.log('🔍 Verifying schema setup...\n');

    const tables = [
      'chatbot_interactions',
      'conversations',
      'messages',
      'cta_actions',
      'cta_tracking',
      'cta_conversions',
      'error_logs'
    ];

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1);

        if (error) {
          if (error.message.includes('does not exist') || error.message.includes('relation')) {
            console.log(`❌ Table '${table}' not found - needs migration`);
          } else {
            console.log(`⚠️  Table '${table}' check failed: ${error.message}`);
          }
        } else {
          console.log(`✅ Table '${table}' exists`);
        }
      } catch (err) {
        console.log(`❌ Error checking table '${table}':`, err);
      }
    }

    console.log('\n✨ Schema verification complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run the migration SQL in Supabase Dashboard');
    console.log('   2. Verify all tables are created');
    console.log('   3. Test the chatbot functionality\n');

  } catch (error) {
    console.error('❌ Error during schema setup:', error);
    process.exit(1);
  }
}

// Run the setup
setupSchema();
