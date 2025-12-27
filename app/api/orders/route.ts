import { NextRequest, NextResponse } from 'next/server'
import { createOrder, getUserOrders } from '../../../lib/supabase/orders-service'
import { CreateOrderSchema } from '../../../lib/schemas/checkout'
import { createClient } from '@supabase/supabase-js'
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Body reçu:', body)

    // Valider les données avec Zod
    let items, total, shippingInfo
    try {
      const validatedData = CreateOrderSchema.parse(body)
      items = validatedData.items
      total = validatedData.total
      shippingInfo = validatedData.shippingInfo
      console.log('Données validées:', { items, total, shippingInfo })
      console.log('Items détail:', items.map(i => ({ serviceId: i.serviceId, title: i.title })))
    } catch (zodError: any) {
      console.error('Erreur Zod:', zodError.errors)
      return NextResponse.json(
        { error: 'Données invalides', details: zodError.errors },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur actuel depuis le header Authorization
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer l'utilisateur avec le token
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Créer la commande avec le client admin (service_role) pour contourner RLS
    const result = await createOrder(user.id, items!, total!, shippingInfo!, supabaseAdmin)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Envoyer la notification WhatsApp (asynchrone, ne pas attendre)
    try {
      const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000'
      await fetch(`${baseUrl}/api/notifications/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: result.order.id,
          customerName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          customerEmail: shippingInfo.email,
          customerPhone: shippingInfo.phone,
          total,
          items,
          shippingAddress: {
            address: shippingInfo.address,
            city: shippingInfo.city,
            postalCode: shippingInfo.postalCode,
            country: shippingInfo.country,
          },
        }),
      })
    } catch (notificationError) {
      console.error('Erreur lors de l\'envoi de la notification WhatsApp:', notificationError)
      // Ne pas bloquer la réponse si la notification échoue
    }

    return NextResponse.json(
      { message: 'Commande créée avec succès', order: result.order },
      { status: 201 }
    )
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la commande' },
      { status: 400 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'utilisateur actuel depuis le header Authorization
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer l'utilisateur avec le token
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer les commandes de l'utilisateur
    const result = await getUserOrders(user.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { orders: result.orders },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des commandes' },
      { status: 400 }
    )
  }
}
