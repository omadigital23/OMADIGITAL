import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  getCart,
  clearCart,
} from '../../../lib/supabase/cart-service'
import { z } from 'zod'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Schémas de validation
const AddToCartSchema = z.object({
  service_id: z.string().min(1),
  title: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
})

const UpdateQuantitySchema = z.object({
  cart_item_id: z.string().uuid(),
  quantity: z.number().int().positive(),
})

const RemoveItemSchema = z.object({
  cart_item_id: z.string().uuid(),
})

// Fonction pour récupérer l'utilisateur depuis le token
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

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await getCart(user.id)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Erreur GET /api/cart:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
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
    const action = body.action

    if (action === 'add') {
      const validated = AddToCartSchema.parse(body)
      const result = await addToCart(
        user.id,
        validated.service_id,
        validated.title,
        validated.price,
        validated.quantity
      )

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { message: 'Item added to cart', item: result.item },
        { status: 201 }
      )
    } else if (action === 'remove') {
      const validated = RemoveItemSchema.parse(body)
      const result = await removeFromCart(user.id, validated.cart_item_id)

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { message: 'Item removed from cart' },
        { status: 200 }
      )
    } else if (action === 'update') {
      const validated = UpdateQuantitySchema.parse(body)
      const result = await updateCartQuantity(
        user.id,
        validated.cart_item_id,
        validated.quantity
      )

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { message: 'Quantity updated', item: result.item },
        { status: 200 }
      )
    } else if (action === 'clear') {
      const result = await clearCart(user.id)

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { message: 'Cart cleared' },
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

    console.error('Erreur POST /api/cart:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
