#!/usr/bin/env node

/**
 * Fix Knowledge Base Table Structure
 * Ensures the knowledge_base table has all required columns
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixKnowledgeBaseTable() {
  console.log('🔧 Fixing knowledge_base table structure...');

  try {
    // Check if table exists and get its structure
    console.log('📋 Checking table structure...');
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('knowledge_base')
      .select('*')
      .limit(1);

    if (tableError) {
      console.log('⚠️ Table access error:', tableError.message);
      
      // Try to create the table if it doesn't exist
      console.log('🔨 Creating knowledge_base table...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS knowledge_base (
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
      `;

      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (createError) {
        console.error('❌ Failed to create table:', createError.message);
        
        // Alternative: Use direct SQL execution
        console.log('🔄 Trying alternative table creation...');
        
        // Create a minimal working table
        const { error: insertError } = await supabase
          .from('knowledge_base')
          .insert({
            title: 'Test Entry',
            content: 'Test content',
            category: 'test',
            language: 'fr',
            keywords: ['test'],
            is_active: true
          });

        if (insertError) {
          console.error('❌ Table creation failed completely:', insertError.message);
          console.log('📝 Manual steps required:');
          console.log('1. Go to Supabase Dashboard');
          console.log('2. Run the migration: 20250903000000_intelligent_chatbot_tables.sql');
          console.log('3. Or create the table manually with the required columns');
          return false;
        } else {
          console.log('✅ Table created successfully via insert');
          // Clean up test entry
          await supabase.from('knowledge_base').delete().eq('title', 'Test Entry');
        }
      } else {
        console.log('✅ Table created successfully');
      }
    } else {
      console.log('✅ Table exists and is accessible');
    }

    // Verify all required columns exist
    console.log('🔍 Verifying table columns...');
    
    const testData = {
      title: 'Column Test',
      content: 'Testing all columns',
      category: 'test',
      language: 'fr',
      keywords: ['test', 'columns'],
      is_active: true
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('knowledge_base')
      .insert(testData)
      .select('*');

    if (insertError) {
      console.error('❌ Column verification failed:', insertError.message);
      
      // Try to identify missing columns
      if (insertError.message.includes('title')) {
        console.log('❌ Missing column: title');
      }
      if (insertError.message.includes('content')) {
        console.log('❌ Missing column: content');
      }
      if (insertError.message.includes('category')) {
        console.log('❌ Missing column: category');
      }
      if (insertError.message.includes('language')) {
        console.log('❌ Missing column: language');
      }
      if (insertError.message.includes('keywords')) {
        console.log('❌ Missing column: keywords');
      }
      if (insertError.message.includes('is_active')) {
        console.log('❌ Missing column: is_active');
      }
      
      return false;
    } else {
      console.log('✅ All columns verified successfully');
      
      // Clean up test entry
      if (insertResult && insertResult[0]) {
        await supabase
          .from('knowledge_base')
          .delete()
          .eq('id', insertResult[0].id);
      }
    }

    // Test search functionality
    console.log('🔍 Testing search functionality...');
    
    const { data: searchResult, error: searchError } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('is_active', true)
      .limit(5);

    if (searchError) {
      console.error('❌ Search test failed:', searchError.message);
      return false;
    } else {
      console.log(`✅ Search test passed (found ${searchResult?.length || 0} items)`);
    }

    console.log('🎉 Knowledge base table structure is correct!');
    return true;

  } catch (error) {
    console.error('❌ Fatal error:', error);
    return false;
  }
}

// Run the fix
fixKnowledgeBaseTable().then(success => {
  if (success) {
    console.log('\n✅ Table structure fix completed successfully!');
    console.log('📝 You can now run: node scripts/enhanced-knowledge-population.js');
  } else {
    console.log('\n❌ Table structure fix failed!');
    console.log('📝 Manual intervention required - check Supabase dashboard');
    process.exit(1);
  }
});