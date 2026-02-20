import { NextRequest, NextResponse } from 'next/server'
import {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  getCart,
  clearCart,
} from '../../../lib/supabase/cart-service'
import { getAuthUser, handleApiError } from '../../../lib/api-utils'
import { z } from 'zod'

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
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve cart')
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
  } catch (error) {
    return handleApiError(error, 'Failed to process cart action')
  }
}
