/**
 * Supabase Client Configuration
 * 
 * @description Centralized Supabase client creation for browser-side usage
 * @security Uses public environment variables only (NEXT_PUBLIC_*)
 * @performance Singleton pattern to avoid multiple client instances
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from './env-public';

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get or create Supabase client instance
 * @returns Supabase client instance or null if configuration is missing
 */
export function getSupabaseClient(): SupabaseClient | null {
  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Validate environment variables
  if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase configuration missing. Please check environment variables.');
    return null;
  }

  try {
    // Create new instance
    supabaseInstance = createClient(
      NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false, // Don't persist auth session in browser
          autoRefreshToken: false,
        },
      }
    );

    console.log('✅ Supabase client initialized successfully');
    return supabaseInstance;
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    return null;
  }
}

/**
 * Check if Supabase is properly configured
 * @returns boolean indicating if Supabase is ready to use
 */
export function isSupabaseConfigured(): boolean {
  return !!(NEXT_PUBLIC_SUPABASE_URL && NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// Export a ready-to-use client instance
export const supabase = getSupabaseClient();
