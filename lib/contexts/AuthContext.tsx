'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
}

interface AuthContextType {
  user: SupabaseUser | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Charger le profil utilisateur
  const loadUserProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single() as any

      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          firstName: data.firstname,
          lastName: data.lastname,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalcode,
          country: data.country,
        })
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
    }
  }

  // Vérifier l'utilisateur au chargement
  useEffect(() => {
    let mounted = true
    let subscription: any = null

    const initializeAuth = async () => {
      try {
        // Récupérer la session stockée
        const { data: { session } } = await supabase.auth.getSession()
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user)
            await loadUserProfile(session.user.id)
          } else {
            setUser(null)
            setProfile(null)
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error)
        if (mounted) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Attendre que le DOM soit prêt
    if (typeof window !== 'undefined') {
      initializeAuth()

      // Écouter les changements d'authentification (une seule fois)
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (mounted) {
          setUser(session?.user || null)

          if (session?.user) {
            await loadUserProfile(session.user.id)
          } else {
            setProfile(null)
          }
        }
      })
      subscription = data.subscription
    } else {
      setLoading(false)
    }

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      // Utiliser directement le client Supabase pour la connexion
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
          },
        },
      })

      if (error) throw error

      // Créer le profil utilisateur
      if (data.user) {
        await (supabase.from('users').insert([
          {
            id: data.user.id,
            email,
            firstname: firstName,
            lastname: lastName,
          },
        ]) as any)

        setUser(data.user)
        await loadUserProfile(data.user.id)
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      // Utiliser directement le client Supabase pour la connexion
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        setUser(data.user)
        await loadUserProfile(data.user.id)
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('Utilisateur non authentifié')

      // Convertir les clés camelCase en minuscules pour Supabase
      const dbUpdates: any = {}
      if (updates.firstName) dbUpdates.firstname = updates.firstName
      if (updates.lastName) dbUpdates.lastname = updates.lastName
      if (updates.phone) dbUpdates.phone = updates.phone
      if (updates.address) dbUpdates.address = updates.address
      if (updates.city) dbUpdates.city = updates.city
      if (updates.postalCode) dbUpdates.postalcode = updates.postalCode
      if (updates.country) dbUpdates.country = updates.country

      const { data } = await (supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', user.id)
        .select()
        .single() as any)

      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          firstName: data.firstname,
          lastName: data.lastname,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalcode,
          country: data.country,
        })
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans AuthProvider')
  }
  return context
}
