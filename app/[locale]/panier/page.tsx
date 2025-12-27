'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCart } from '../../../lib/contexts/CartContext'
import Link from 'next/link'

export default function CartPage() {
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const { items, removeItem, updateQuantity, total } = useCart()
  const [translations, setTranslations] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await fetch(`/locales/${locale}/common.json`)
        const data = await response.json()
        setTranslations(data)
      } catch (err) {
        console.error('Erreur lors du chargement des traductions:', err)
      } finally {
        setLoading(false)
      }
    }
    loadTranslations()
  }, [locale])

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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {translations.cart?.title || 'Mon Panier'}
          </h1>
          <p className="text-gray-600 mb-8">
            {translations.cart?.empty || 'Votre panier est vide'}
          </p>
          <Link
            href={`/${locale}/services`}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            {translations.cart?.continue_shopping || 'Continuer vos achats'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {translations.cart?.title || 'Mon Panier'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Articles du panier */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-lg p-6 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {translations.cart?.price || 'Prix'}: {item.price.toFixed(2)} DH
                    </p>
                  </div>

                  {/* Contrôles de quantité */}
                  <div className="flex items-center gap-4 mx-6">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
                      aria-label="Diminuer la quantité"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <span className="text-lg font-semibold text-gray-900 w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
                      aria-label="Augmenter la quantité"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Sous-total */}
                  <div className="text-right mr-6">
                    <p className="text-lg font-semibold text-gray-900">
                      {(item.price * item.quantity).toFixed(2)} DH
                    </p>
                  </div>

                  {/* Bouton supprimer */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600"
                    aria-label="Supprimer l'article"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Résumé du panier */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {translations.cart?.total || 'Total'}
              </h2>

              <div className="space-y-4 mb-6 border-b border-gray-200 pb-6">
                <div className="flex justify-between text-gray-600">
                  <span>
                    {items.length} {items.length === 1 ? translations.cart?.item : translations.cart?.items}
                  </span>
                  <span>{total.toFixed(2)} DH</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>{translations.cart?.total || 'Total'}:</span>
                  <span>{total.toFixed(2)} DH</span>
                </div>
              </div>

              <Link
                href={`/${locale}/checkout`}
                className="w-full block text-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                {translations.cart?.checkout || 'Passer la commande'}
              </Link>

              <Link
                href={`/${locale}/services`}
                className="w-full block text-center mt-3 bg-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold"
              >
                {translations.cart?.continue_shopping || 'Continuer vos achats'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
