'use client'

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Créer un storage personnalisé pour la persistance
class CustomStorage {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error('Storage getItem error:', error)
      return null
    }
  }

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error('Storage setItem error:', error)
    }
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Storage removeItem error:', error)
    }
  }
}

// Singleton global pour éviter plusieurs instances GoTrueClient en dev (HMR)
const globalForSupabase = globalThis as unknown as {
  omaSupabaseClient?: SupabaseClient
}

export const supabase: SupabaseClient =
  globalForSupabase.omaSupabaseClient ||
  (globalForSupabase.omaSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: new CustomStorage(),
    },
  }))