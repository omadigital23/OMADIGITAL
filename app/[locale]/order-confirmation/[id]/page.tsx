'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '../../../../lib/contexts/AuthContext'
import { supabase } from '../../../../lib/supabase/client'
import Link from 'next/link'

export default function OrderConfirmationPage() {
  const params = useParams()
  const locale = params.locale as string
  const orderId = params.id as string
  const { user } = useAuth()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [translations, setTranslations] = useState<any>({})

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await fetch(`/locales/${locale}/common.json`)
        const data = await response.json()
        setTranslations(data)
      } catch (err) {
        console.error('Erreur lors du chargement des traductions:', err)
      }
    }
    loadTranslations()
  }, [locale])

  useEffect(() => {
    const loadOrder = async () => {
      try {
        if (!user) {
          setError(translations.checkout?.required_field || 'Vous devez être connecté')
          return
        }

        const { data, error: fetchError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items(*)
          `)
          .eq('id', orderId)
          .eq('user_id', user.id)
          .single()

        if (fetchError) throw fetchError
        setOrder(data)
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement de la commande')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadOrder()
    }
  }, [user, orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-600 mb-8">{error || 'Commande non trouvée'}</p>
          <Link
            href={`/${locale}/services`}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Retour aux services
          </Link>
        </div>
      </div>
    )
  }

  const statusLabels: { [key: string]: string } = {
    pending: translations.orders?.status_pending || 'En attente',
    confirmed: translations.orders?.status_confirmed || 'Confirmée',
    processing: translations.orders?.status_processing || 'En traitement',
    completed: translations.orders?.status_completed || 'Livrée',
    cancelled: translations.orders?.status_cancelled || 'Annulée',
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* En-tête de confirmation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {translations.checkout?.order_confirmed || 'Commande Confirmée'}
          </h1>
          <p className="text-gray-600">
            {translations.checkout?.thank_you || 'Merci pour votre commande'}
          </p>
        </div>

        {/* Détails de la commande */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">{translations.orders?.order_id || 'Numéro de Commande'}</p>
              <p className="text-lg font-semibold text-gray-900">{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{translations.orders?.status || 'Statut'}</p>
              <p className="text-lg font-semibold text-gray-900">{statusLabels[order.status]}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{translations.orders?.date || 'Date'}</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(order.created_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{translations.orders?.total || 'Total'}</p>
              <p className="text-lg font-semibold text-gray-900">{order.total_amount.toFixed(2)} DH</p>
            </div>
          </div>

          {/* Informations de livraison */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {translations.checkout?.shipping_info || 'Informations de Livraison'}
            </h2>
            <div className="text-gray-600">
              <p>
                {order.shipping_info.firstName} {order.shipping_info.lastName}
              </p>
              <p>{order.shipping_info.address}</p>
              <p>
                {order.shipping_info.postalCode} {order.shipping_info.city}
              </p>
              <p>{order.shipping_info.country}</p>
              <p className="mt-2">{order.shipping_info.email}</p>
              <p>{order.shipping_info.phone}</p>
            </div>
          </div>
        </div>

        {/* Articles de la commande */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {translations.checkout?.order_details || 'Détails de la Commande'}
          </h2>
          <div className="space-y-4">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">
                    {translations.cart?.quantity || 'Quantité'}: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">{(item.price * item.quantity).toFixed(2)} DH</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href={`/${locale}/orders`}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-center"
          >
            {translations.orders?.title || 'Mes Commandes'}
          </Link>
          <Link
            href={`/${locale}/services`}
            className="flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-300 text-center"
          >
            {translations.cart?.continue_shopping || 'Continuer vos achats'}
          </Link>
        </div>
      </div>
    </div>
  )
}
