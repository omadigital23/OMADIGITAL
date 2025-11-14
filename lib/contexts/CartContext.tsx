'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { CartItem } from '@/lib/types/cart'
import { useAuth } from './AuthContext'
import { supabase } from '@/lib/supabase/client'

// Utiliser le même client Supabase partagé pour la synchronisation

interface CartContextType {
  items: CartItem[]
  total: number
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading } = useAuth()
  const [cartLoaded, setCartLoaded] = useState(false)

  // Charger le panier depuis Supabase (si authentifié) ou localStorage
  useEffect(() => {
    let mounted = true
    
    const loadCart = async () => {
      try {
        if (user && mounted) {
          // Charger depuis Supabase si l'utilisateur est authentifié
          const { data, error } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id)

          if (!error && data && mounted) {
            const cartItems = data.map((item: any) => ({
              id: item.id,
              serviceId: item.service_id,
              title: item.title,
              price: item.price,
              quantity: item.quantity,
              addedAt: new Date(item.added_at),
            }))
            setItems(cartItems)
            setCartLoaded(true)
            setLoading(false)
            return
          }
        }

        // Fallback à localStorage
        if (mounted) {
          const savedCart = localStorage.getItem('cart')
          if (savedCart) {
            try {
              const parsedCart = JSON.parse(savedCart)
              setItems(parsedCart)
            } catch (error) {
              console.error('Erreur lors du chargement du panier:', error)
            }
          }
          setCartLoaded(true)
          setLoading(false)
        }
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error)
        if (mounted) {
          setCartLoaded(true)
          setLoading(false)
        }
      }
    }

    // Charger le panier seulement si l'authentification est complète
    if (!authLoading) {
      loadCart()
    }

    return () => {
      mounted = false
    }
  }, [user?.id, authLoading])

  // Calculer le total
  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotal(newTotal)
  }, [items])

  // Sauvegarder le panier dans Supabase (si authentifié) ou localStorage
  useEffect(() => {
    const saveCart = async () => {
      try {
        if (user && cartLoaded) {
          console.log('Sauvegarde du panier dans Supabase pour user:', user.id)
          // Sauvegarder dans Supabase
          // D'abord, supprimer les anciens articles
          await supabase.from('cart_items').delete().eq('user_id', user.id)

          // Ensuite, insérer les nouveaux articles
          if (items.length > 0) {
            const cartItems = items.map((item) => ({
              user_id: user.id,
              service_id: item.serviceId,
              title: item.title,
              price: item.price,
              quantity: item.quantity,
            }))

            await (supabase.from('cart_items').insert(cartItems) as any)
            console.log('Panier sauvegardé dans Supabase:', items.length, 'items')
          }
          return
        }

        // Fallback à localStorage
        console.log('Sauvegarde du panier dans localStorage:', items.length, 'items')
        localStorage.setItem('cart', JSON.stringify(items))
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du panier:', error)
      }
    }

    // Sauvegarder seulement si le panier est chargé
    if (cartLoaded) {
      saveCart()
    }
  }, [items, user, cartLoaded])

  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.serviceId === newItem.serviceId)
      if (existingItem) {
        return prevItems.map((item) =>
          item.serviceId === newItem.serviceId
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      }
      return [...prevItems, newItem]
    })
  }

  const removeItem = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  return (
    <CartContext.Provider value={{ items, total, addItem, removeItem, updateQuantity, clearCart, loading }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart doit être utilisé dans CartProvider')
  }
  return context
}
