import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client anonyme pour les opérations publiques
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client service role pour les opérations sensibles (signup)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function signUp(email: string, password: string, firstName: string, lastName: string) {
  try {
    // Créer l'utilisateur avec le client admin (avec confirmation automatique)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        firstName,
        lastName,
      },
    })

    if (authError) throw authError

    // Créer le profil utilisateur dans la table users
    if (authData.user) {
      const { error: profileError } = await supabaseAdmin.from('users').insert([
        {
          id: authData.user.id,
          email,
          firstname: firstName,
          lastname: lastName,
          created_at: new Date(),
        },
      ])

      if (profileError) throw profileError
    }

    return { success: true, user: authData.user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return { success: true, user: data.user, session: data.session }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return { success: true, user: data.user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return { success: true, profile: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateUserProfile(userId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return { success: true, profile: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
