import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function createOrder(
  userId: string,
  items: any[],
  total: number,
  shippingInfo: any,
  supabaseClient?: SupabaseClient
) {
  try {
    console.log('Création commande:', { userId, items, total, shippingInfo })
    
    // Utiliser le client fourni ou le client par défaut
    const client = supabaseClient || supabase
    
    // Calculer les montants (50% avance, 50% à la livraison)
    const advanceAmount = total * 0.5
    const remainingAmount = total * 0.5

    // Déterminer le délai de livraison
    // 2 semaines pour "Site Vitrine (Standard)", 30 jours pour les autres
    const deliveryDays = items.some(item => item.title?.includes('Site Vitrine')) ? 14 : 30
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays)

    // Créer la commande
    const { data: orderData, error: orderError } = await client
      .from('orders')
      .insert([
        {
          user_id: userId,
          total_amount: total,
          shipping_info: shippingInfo,
          payment_info: {
            advance_paid: false,
            advance_amount: advanceAmount,
            remaining_amount: remainingAmount,
            payment_status: 'pending',
            delivery_date: deliveryDate.toISOString(),
            delivery_days: deliveryDays,
          },
          status: 'pending',
        },
      ])
      .select()
      .single()

    console.log('Commande créée:', orderData)
    if (orderError) {
      console.error('Erreur commande:', orderError)
      throw orderError
    }

    // Créer les articles de la commande dans order_items
    if (items && items.length > 0) {
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        service_id: item.serviceId || item.service_id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      }))

      const { error: itemsError } = await client
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Erreur insertion order_items:', itemsError)
        throw itemsError
      }
    }

    // Supprimer les articles du panier
    const { error: deleteError } = await client
      .from('cart_items')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      console.error('Erreur suppression panier:', deleteError)
      // Ne pas bloquer si la suppression du panier échoue
    }

    return { success: true, order: orderData }
  } catch (error: any) {
    console.error('Erreur createOrder:', error)
    return { success: false, error: error.message }
  }
}

export async function getUserOrders(userId: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, orders: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getOrderById(orderId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('id', orderId)
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return { success: true, order: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date(),
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error
    return { success: true, order: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function confirmOrder(orderId: string) {
  try {
    // Mettre à jour le statut à 'confirmed'
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'confirmed',
        updated_at: new Date(),
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error
    return { success: true, order: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function cancelOrder(orderId: string, userId: string) {
  try {
    // Vérifier que l'ordre appartient à l'utilisateur
    const { data: order, error: selectError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (selectError) throw selectError
    if (order.user_id !== userId) {
      return { success: false, error: 'Forbidden' }
    }

    // Vérifier que le countdown n'a pas expiré
    if (order.payment_info?.delivery_date) {
      const deliveryDate = new Date(order.payment_info.delivery_date)
      if (new Date() > deliveryDate) {
        return { success: false, error: 'Cannot cancel: delivery date passed' }
      }
    }

    // Annuler la commande
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date(),
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error
    return { success: true, order: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getAllOrders(limit = 50, offset = 0) {
  try {
    const { data, error, count } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_items(*),
        users(firstname, lastname, email)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { success: true, orders: data, total: count }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
