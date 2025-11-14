import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { confirmOrder, getAllOrders } from '@/lib/supabase/orders-service'
import { z } from 'zod'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Créer les clients une seule fois (singleton pattern)
let supabaseInstance: ReturnType<typeof createClient> | null = null
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey)
  }
  return supabaseAdminInstance
}

const supabase = getSupabaseClient()
const supabaseAdmin = getSupabaseAdmin()

// Schémas de validation
const ConfirmOrderSchema = z.object({
  order_id: z.string().uuid(),
})

// Vérifier si l'utilisateur est admin
async function isAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    return false
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return false
  }

  // Vérifier si l'utilisateur est dans la table admin_users
  const { data: adminUser, error: adminError } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .single()

  return !adminError && adminUser
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await getAllOrders(limit, offset)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        orders: result.orders,
        total: result.total,
        limit,
        offset,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Erreur GET /api/admin/orders:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const action = body.action

    if (action === 'confirm') {
      const validated = ConfirmOrderSchema.parse(body)
      const result = await confirmOrder(validated.order_id)

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { message: 'Order confirmed', order: result.order },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur POST /api/admin/orders:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
