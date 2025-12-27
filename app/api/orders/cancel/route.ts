import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cancelOrder } from '../../../../lib/supabase/orders-service'
import { getCancelRestrictions } from '../../../../lib/supabase/countdown-service'
import { z } from 'zod'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const CancelOrderSchema = z.object({
  order_id: z.string().uuid(),
})

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    return null
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return null
  }

  return user
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validated = CancelOrderSchema.parse(body)

    // Vérifier les restrictions
    const restrictionResult = await getCancelRestrictions(validated.order_id, user.id)
    if (!restrictionResult.success) {
      return NextResponse.json(
        { error: restrictionResult.error },
        { status: 400 }
      )
    }

    if (!restrictionResult.canCancel) {
      return NextResponse.json(
        {
          error: 'Cannot cancel order',
          restrictions: restrictionResult.restrictions,
        },
        { status: 400 }
      )
    }

    // Annuler la commande
    const result = await cancelOrder(validated.order_id, user.id)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Order cancelled successfully', order: result.order },
      { status: 200 }
    )
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur POST /api/orders/cancel:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
