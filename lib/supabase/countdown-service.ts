import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export interface CountdownInfo {
  orderId: string
  deliveryDate: string
  deliveryDays: number
  remainingDays: number
  remainingHours: number
  remainingMinutes: number
  isExpired: boolean
  canCancel: boolean
}

/**
 * Calculer les informations de countdown pour une commande
 */
export function calculateCountdown(order: any): CountdownInfo {
  const deliveryDate = new Date(order.payment_info?.delivery_date)
  const now = new Date()
  const diffMs = deliveryDate.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  const isExpired = diffMs <= 0
  const canCancel = !isExpired && order.status === 'pending'

  return {
    orderId: order.id,
    deliveryDate: deliveryDate.toISOString(),
    deliveryDays: order.payment_info?.delivery_days || 30,
    remainingDays: Math.max(0, diffDays),
    remainingHours: Math.max(0, diffHours),
    remainingMinutes: Math.max(0, diffMinutes),
    isExpired,
    canCancel,
  }
}

/**
 * Récupérer le countdown pour une commande spécifique
 */
export async function getOrderCountdown(orderId: string, userId: string) {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single()

    if (error) throw error
    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    const countdown = calculateCountdown(order)
    return { success: true, countdown }
  } catch (error: any) {
    console.error('Erreur getOrderCountdown:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Récupérer les countdowns pour toutes les commandes d'un utilisateur
 */
export async function getUserCountdowns(userId: string) {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const countdowns = orders.map(order => calculateCountdown(order))

    return { success: true, countdowns }
  } catch (error: any) {
    console.error('Erreur getUserCountdowns:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Vérifier si une commande peut être annulée
 */
export async function canCancelOrder(orderId: string, userId: string): Promise<boolean> {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single()

    if (error || !order) return false

    const countdown = calculateCountdown(order)
    return countdown.canCancel
  } catch (error) {
    console.error('Erreur canCancelOrder:', error)
    return false
  }
}

/**
 * Obtenir les raisons pour lesquelles une commande ne peut pas être annulée
 */
export async function getCancelRestrictions(orderId: string, userId: string) {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single()

    if (error) throw error
    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    const countdown = calculateCountdown(order)
    const restrictions = []

    if (countdown.isExpired) {
      restrictions.push('Délai de livraison expiré')
    }

    if (order.status !== 'pending') {
      restrictions.push(`Commande en statut: ${order.status}`)
    }

    if (order.status === 'confirmed') {
      restrictions.push('Commande confirmée par l\'admin')
    }

    if (order.status === 'processing') {
      restrictions.push('Commande en cours de traitement')
    }

    if (order.status === 'completed') {
      restrictions.push('Commande livrée')
    }

    if (order.status === 'cancelled') {
      restrictions.push('Commande déjà annulée')
    }

    return {
      success: true,
      canCancel: countdown.canCancel,
      restrictions,
    }
  } catch (error: any) {
    console.error('Erreur getCancelRestrictions:', error)
    return { success: false, error: error.message }
  }
}
