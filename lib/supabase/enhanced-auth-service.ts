import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// ============================================================================
// TYPES
// ============================================================================

interface SignUpResult {
  success: boolean
  user?: any
  error?: string
}

interface SignInResult {
  success: boolean
  user?: any
  session?: any
  error?: string
}

interface AuthLogEntry {
  user_id?: string
  action: string
  status: 'success' | 'failed' | 'blocked'
  ip_address?: string
  user_agent?: string
  error_message?: string
  metadata?: Record<string, any>
}

// ============================================================================
// RATE LIMITING
// ============================================================================

export async function checkRateLimit(
  ipAddress: string,
  endpoint: string,
  maxAttempts: number = 5,
  windowMinutes: number = 15
) {
  try {
    const { data: existing } = await supabaseAdmin
      .from('rate_limits')
      .select('*')
      .eq('ip_address', ipAddress)
      .eq('endpoint', endpoint)
      .single()

    if (!existing) {
      // First attempt
      await supabaseAdmin.from('rate_limits').insert([
        {
          ip_address: ipAddress,
          endpoint,
          attempt_count: 1,
        },
      ])
      return { allowed: true, remaining: maxAttempts - 1 }
    }

    // Check if blocked
    if (existing.blocked_until) {
      const now = new Date()
      if (new Date(existing.blocked_until) > now) {
        return { allowed: false, remaining: 0, blockedUntil: existing.blocked_until }
      }
      // Unblock if window expired
      await supabaseAdmin
        .from('rate_limits')
        .update({ attempt_count: 1, blocked_until: null })
        .eq('id', existing.id)
      return { allowed: true, remaining: maxAttempts - 1 }
    }

    // Check window
    const lastAttempt = new Date(existing.last_attempt_at)
    const now = new Date()
    const minutesPassed = (now.getTime() - lastAttempt.getTime()) / (1000 * 60)

    if (minutesPassed > windowMinutes) {
      // Reset counter
      await supabaseAdmin
        .from('rate_limits')
        .update({ attempt_count: 1, first_attempt_at: now })
        .eq('id', existing.id)
      return { allowed: true, remaining: maxAttempts - 1 }
    }

    // Increment counter
    const newCount = existing.attempt_count + 1
    const blockedUntil = newCount >= maxAttempts
      ? new Date(now.getTime() + windowMinutes * 60 * 1000)
      : null

    await supabaseAdmin
      .from('rate_limits')
      .update({
        attempt_count: newCount,
        last_attempt_at: now,
        blocked_until: blockedUntil,
      })
      .eq('id', existing.id)

    if (newCount >= maxAttempts) {
      return { allowed: false, remaining: 0, blockedUntil }
    }

    return { allowed: true, remaining: maxAttempts - newCount }
  } catch (error) {
    console.error('Rate limit check error:', error)
    return { allowed: true, remaining: maxAttempts }
  }
}

// ============================================================================
// AUTH LOGGING
// ============================================================================

export async function logAuthAction(entry: AuthLogEntry) {
  try {
    await supabaseAdmin.from('auth_logs').insert([
      {
        user_id: entry.user_id,
        action: entry.action,
        status: entry.status,
        ip_address: entry.ip_address,
        user_agent: entry.user_agent,
        error_message: entry.error_message,
        metadata: entry.metadata || {},
      },
    ])
  } catch (error) {
    console.error('Auth logging error:', error)
  }
}

// ============================================================================
// EMAIL VERIFICATION
// ============================================================================

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function createEmailVerification(userId: string, email: string) {
  try {
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const { error } = await supabaseAdmin.from('email_verifications').insert([
      {
        user_id: userId,
        email,
        token,
        expires_at: expiresAt,
      },
    ])

    if (error) throw error

    return { success: true, token }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function verifyEmail(token: string) {
  try {
    const { data: verification, error: selectError } = await supabaseAdmin
      .from('email_verifications')
      .select('*')
      .eq('token', token)
      .single()

    if (selectError || !verification) {
      return { success: false, error: 'Token invalide' }
    }

    if (new Date(verification.expires_at) < new Date()) {
      return { success: false, error: 'Token expiré' }
    }

    if (verification.verified_at) {
      return { success: false, error: 'Email déjà vérifié' }
    }

    // Mark as verified
    const { error: updateError } = await supabaseAdmin
      .from('email_verifications')
      .update({ verified_at: new Date() })
      .eq('id', verification.id)

    if (updateError) throw updateError

    return { success: true, userId: verification.user_id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ============================================================================
// PASSWORD RESET
// ============================================================================

export async function createPasswordReset(email: string) {
  try {
    // Find user by email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    const user = userData?.users.find((u) => u.email === email)

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return { success: true, message: 'Si cet email existe, un lien de réinitialisation a été envoyé' }
    }

    const token = generateToken()
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

    const { error } = await supabaseAdmin.from('password_resets').insert([
      {
        user_id: user.id,
        token,
        expires_at: expiresAt,
      },
    ])

    if (error) throw error

    return { success: true, token, message: 'Lien de réinitialisation envoyé' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    const { data: reset, error: selectError } = await supabaseAdmin
      .from('password_resets')
      .select('*')
      .eq('token', token)
      .single()

    if (selectError || !reset) {
      return { success: false, error: 'Token invalide' }
    }

    if (new Date(reset.expires_at) < new Date()) {
      return { success: false, error: 'Token expiré' }
    }

    if (reset.used_at) {
      return { success: false, error: 'Token déjà utilisé' }
    }

    // Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(reset.user_id, {
      password: newPassword,
    })

    if (updateError) throw updateError

    // Mark token as used
    await supabaseAdmin
      .from('password_resets')
      .update({ used_at: new Date() })
      .eq('id', reset.id)

    return { success: true, message: 'Mot de passe réinitialisé' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export async function createSession(
  userId: string,
  refreshToken: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const { error } = await supabaseAdmin.from('auth_sessions').insert([
      {
        user_id: userId,
        refresh_token: refreshToken,
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: expiresAt,
      },
    ])

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function validateSession(refreshToken: string) {
  try {
    const { data: session, error } = await supabaseAdmin
      .from('auth_sessions')
      .select('*')
      .eq('refresh_token', refreshToken)
      .eq('is_active', true)
      .single()

    if (error || !session) {
      return { valid: false }
    }

    if (new Date(session.expires_at) < new Date()) {
      // Invalidate expired session
      await supabaseAdmin
        .from('auth_sessions')
        .update({ is_active: false })
        .eq('id', session.id)
      return { valid: false }
    }

    return { valid: true, userId: session.user_id }
  } catch (error) {
    return { valid: false }
  }
}

export async function invalidateSession(refreshToken: string) {
  try {
    await supabaseAdmin
      .from('auth_sessions')
      .update({ is_active: false })
      .eq('refresh_token', refreshToken)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ============================================================================
// SIGN UP (Enhanced)
// ============================================================================

export async function signUpEnhanced(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  ipAddress?: string,
  userAgent?: string
): Promise<SignUpResult> {
  try {
    // Check rate limit
    const rateLimit = await checkRateLimit(ipAddress || '0.0.0.0', 'signup', 10, 60)
    if (!rateLimit.allowed) {
      await logAuthAction({
        action: 'signup_attempt',
        status: 'blocked',
        ip_address: ipAddress,
        user_agent: userAgent,
        error_message: 'Rate limit exceeded',
      })
      return { success: false, error: 'Trop de tentatives. Réessayez plus tard.' }
    }

    // Create user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email to allow immediate sign in
      user_metadata: {
        firstName,
        lastName,
      },
    })

    if (authError) {
      await logAuthAction({
        action: 'signup_attempt',
        status: 'failed',
        ip_address: ipAddress,
        user_agent: userAgent,
        error_message: authError.message,
      })
      return { success: false, error: authError.message }
    }

    // Create user profile
    if (authData.user) {
      const { error: profileError } = await supabaseAdmin.from('users').insert([
        {
          id: authData.user.id,
          email,
          firstname: firstName,
          lastname: lastName,
        },
      ])

      if (profileError) {
        await logAuthAction({
          user_id: authData.user.id,
          action: 'signup_attempt',
          status: 'failed',
          ip_address: ipAddress,
          user_agent: userAgent,
          error_message: profileError.message,
        })
        return { success: false, error: profileError.message }
      }

      // Create email verification
      await createEmailVerification(authData.user.id, email)

      await logAuthAction({
        user_id: authData.user.id,
        action: 'signup_success',
        status: 'success',
        ip_address: ipAddress,
        user_agent: userAgent,
      })

      return { success: true, user: authData.user }
    }

    return { success: false, error: 'Erreur lors de la création du compte' }
  } catch (error: any) {
    await logAuthAction({
      action: 'signup_attempt',
      status: 'failed',
      ip_address: ipAddress,
      user_agent: userAgent,
      error_message: error.message,
    })
    return { success: false, error: error.message }
  }
}

// ============================================================================
// SIGN IN (Enhanced)
// ============================================================================

export async function signInEnhanced(
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<SignInResult> {
  try {
    // Check rate limit
    const rateLimit = await checkRateLimit(ipAddress || '0.0.0.0', 'signin', 5, 15)
    if (!rateLimit.allowed) {
      await logAuthAction({
        action: 'signin_attempt',
        status: 'blocked',
        ip_address: ipAddress,
        user_agent: userAgent,
        error_message: 'Rate limit exceeded',
      })
      return { success: false, error: 'Trop de tentatives. Réessayez plus tard.' }
    }

    // Sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      await logAuthAction({
        action: 'signin_attempt',
        status: 'failed',
        ip_address: ipAddress,
        user_agent: userAgent,
        error_message: error.message,
      })
      return { success: false, error: error.message }
    }

    // Create session
    if (data.user && data.session?.refresh_token) {
      await createSession(data.user.id, data.session.refresh_token, ipAddress, userAgent)
    }

    await logAuthAction({
      user_id: data.user?.id,
      action: 'signin_success',
      status: 'success',
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    return { success: true, user: data.user, session: data.session }
  } catch (error: any) {
    await logAuthAction({
      action: 'signin_attempt',
      status: 'failed',
      ip_address: ipAddress,
      user_agent: userAgent,
      error_message: error.message,
    })
    return { success: false, error: error.message }
  }
}

// ============================================================================
// SIGN OUT (Enhanced)
// ============================================================================

export async function signOutEnhanced(refreshToken?: string) {
  try {
    if (refreshToken) {
      await invalidateSession(refreshToken)
    }
    await supabase.auth.signOut()
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ============================================================================
// GET CURRENT USER
// ============================================================================

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return { success: true, user: data.user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ============================================================================
// GET USER PROFILE
// ============================================================================

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

// ============================================================================
// UPDATE USER PROFILE
// ============================================================================

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
