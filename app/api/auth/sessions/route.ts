import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET - List user sessions
export async function GET(request: NextRequest) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { data: sessions, error } = await supabaseAdmin
      .from('auth_sessions')
      .select('id, ip_address, user_agent, created_at, is_active')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ sessions }, { status: 200 })
  } catch (error: any) {
    console.error('Get sessions error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des sessions' },
      { status: 400 }
    )
  }
}

// DELETE - Logout from all sessions
export async function DELETE(request: NextRequest) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Invalidate all sessions
    const { error } = await supabaseAdmin
      .from('auth_sessions')
      .update({ is_active: false })
      .eq('user_id', user.id)

    if (error) throw error

    // Sign out from Supabase
    await supabase.auth.signOut()

    return NextResponse.json(
      { message: 'Déconnecté de toutes les sessions' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Logout all error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la déconnexion' },
      { status: 400 }
    )
  }
}
