'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '../../../lib/contexts/AuthContext'
import { supabase } from '../../../lib/supabase/client'
import Link from 'next/link'

export default function OrdersPage() {
  const params = useParams()
  const locale = params.locale as string
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
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
    const loadOrders = async () => {
      try {


        if (!user) {
          setError(translations.checkout?.required_field || 'Vous devez être connecté')
          setLoading(false)
          return
        }

        const { data, error: fetchError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })



        if (fetchError) {
          console.error('Erreur fetch:', fetchError)
          throw fetchError
        }

        setOrders(data || [])
      } catch (err: any) {
        console.error('Erreur loadOrders:', err)
        setError(err.message || 'Erreur lors du chargement des commandes')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadOrders()
    }
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {locale === 'fr' ? 'Accès Requis' : 'Access Required'}
          </h1>
          <p className="text-gray-600 mb-8">
            {locale === 'fr'
              ? 'Vous devez être connecté pour voir vos commandes'
              : 'You must be logged in to view your orders'}
          </p>
          <Link
            href={`/${locale}`}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            {locale === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
          </Link>
        </div>
      </div>
    )
  }

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

  const statusLabels: { [key: string]: string } = {
    pending: translations.orders?.status_pending || 'En attente',
    confirmed: translations.orders?.status_confirmed || 'Confirmée',
    processing: translations.orders?.status_processing || 'En traitement',
    completed: translations.orders?.status_completed || 'Livrée',
    cancelled: translations.orders?.status_cancelled || 'Annulée',
  }

  const statusColors: { [key: string]: string } = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {translations.orders?.title || 'Mes Commandes'}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-8">
              {translations.orders?.no_orders || 'Vous n\'avez pas de commandes'}
            </p>
            <Link
              href={`/${locale}/services`}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              {translations.cart?.continue_shopping || 'Continuer vos achats'}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/${locale}/order-confirmation/${order.id}`}
                className="block bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{translations.orders?.order_id || 'Numéro de Commande'}</p>
                    <p className="font-semibold text-gray-900 truncate">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{translations.orders?.date || 'Date'}</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(order.created_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{translations.orders?.items || 'Articles'}</p>
                    <p className="font-semibold text-gray-900">{order.order_items?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{translations.orders?.total || 'Total'}</p>
                    <p className="font-semibold text-gray-900">{order.total_amount.toFixed(2)} DH</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{translations.orders?.status || 'Statut'}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
