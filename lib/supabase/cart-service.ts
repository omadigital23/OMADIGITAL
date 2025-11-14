import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export interface CartItem {
  id: string
  user_id: string
  service_id: string
  title: string
  price: number
  quantity: number
  added_at: string
}

export async function addToCart(
  userId: string,
  serviceId: string,
  title: string,
  price: number,
  quantity: number
) {
  try {
    // Vérifier si l'item existe déjà
    const { data: existing, error: selectError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('service_id', serviceId)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError
    }

    if (existing) {
      // Mettre à jour la quantité
      const { data, error } = await supabase
        .from('cart_items')
        .update({
          quantity: existing.quantity + quantity,
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return { success: true, item: data }
    } else {
      // Insérer nouvel item
      const { data, error } = await supabase
        .from('cart_items')
        .insert([
          {
            user_id: userId,
            service_id: serviceId,
            title,
            price,
            quantity,
          },
        ])
        .select()
        .single()

      if (error) throw error
      return { success: true, item: data }
    }
  } catch (error: any) {
    console.error('Erreur addToCart:', error)
    return { success: false, error: error.message }
  }
}

export async function removeFromCart(userId: string, cartItemId: string) {
  try {
    // Vérifier ownership
    const { data: item, error: selectError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('id', cartItemId)
      .single()

    if (selectError) throw selectError
    if (item.user_id !== userId) {
      return { success: false, error: 'Forbidden' }
    }

    // Supprimer
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('Erreur removeFromCart:', error)
    return { success: false, error: error.message }
  }
}

export async function updateCartQuantity(
  userId: string,
  cartItemId: string,
  quantity: number
) {
  try {
    if (quantity < 1) {
      return { success: false, error: 'Quantity must be >= 1' }
    }

    // Vérifier ownership
    const { data: item, error: selectError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('id', cartItemId)
      .single()

    if (selectError) throw selectError
    if (item.user_id !== userId) {
      return { success: false, error: 'Forbidden' }
    }

    // Mettre à jour
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .select()
      .single()

    if (error) throw error
    return { success: true, item: data }
  } catch (error: any) {
    console.error('Erreur updateCartQuantity:', error)
    return { success: false, error: error.message }
  }
}

export async function getCart(userId: string) {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false })

    if (error) throw error

    const total = data.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return {
      success: true,
      items: data,
      total,
      itemCount: data.length,
    }
  } catch (error: any) {
    console.error('Erreur getCart:', error)
    return { success: false, error: error.message }
  }
}

export async function clearCart(userId: string) {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('Erreur clearCart:', error)
    return { success: false, error: error.message }
  }
}
