import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET - List user auth logs
export async function GET(request: NextRequest) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')

    let query = supabaseAdmin
      .from('auth_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: logs, count, error } = await query
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json(
      { 
        logs, 
        total: count,
        limit,
        offset 
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get auth logs error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des logs' },
      { status: 400 }
    )
  }
}
