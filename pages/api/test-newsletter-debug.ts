/**
 * API de test pour diagnostiquer le problème newsletter
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Debug Newsletter API...');
    
    // Test 1: Variables d'environnement
    const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
    const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
    
    console.log('Environment check:');
    console.log('- URL:', supabaseUrl);
    console.log('- Service Key:', supabaseServiceKey ? 'Present' : 'Missing');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ 
        error: 'Missing environment variables',
        details: {
          url: !!supabaseUrl,
          serviceKey: !!supabaseServiceKey
        }
      });
    }

    // Test 2: Connexion Supabase
    console.log('Testing Supabase connection...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test 3: Vérification table blog_subscribers
    console.log('Checking blog_subscribers table...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('blog_subscribers')
      .select('*', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('Table error:', tableError);
      
      if (tableError.message.includes('relation "blog_subscribers" does not exist')) {
        return res.status(500).json({
          error: 'Table blog_subscribers does not exist',
          solution: 'Run the migration: 20250912000000_fix_blog_subscribers_schema.sql',
          tableError: tableError.message
        });
      }
      
      return res.status(500).json({
        error: 'Database error',
        details: tableError
      });
    }

    // Test 4: Test insertion
    console.log('Testing insert operation...');
    const testEmail = `debug-api-${Date.now()}@example.com`;
    
    const { data: insertResult, error: insertError } = await supabase
      .from('blog_subscribers')
      .insert({
        email: testEmail,
        status: 'pending',
        confirmation_token: 'debug-token-' + Date.now(),
        unsubscribe_token: 'debug-unsubscribe-' + Date.now(),
        source: 'debug-api',
        subscribed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({
        error: 'Insert operation failed',
        details: insertError
      });
    }

    // Test 5: Nettoyage
    await supabase
      .from('blog_subscribers')
      .delete()
      .eq('email', testEmail);

    // Succès
    return res.status(200).json({
      success: true,
      message: 'Newsletter system is working correctly',
      tests: {
        environment: '✅ OK',
        connection: '✅ OK',
        table: '✅ OK',
        insert: '✅ OK',
        cleanup: '✅ OK'
      },
      tableInfo: {
        totalSubscribers: tableCheck?.count || 0
      },
      testEmail: testEmail
    });

  } catch (error) {
    console.error('Newsletter debug error:', error);
    return res.status(500).json({
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}