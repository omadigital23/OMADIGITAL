'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useCart } from '../../../lib/contexts/CartContext'
import { useAuth } from '../../../lib/contexts/AuthContext'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckoutSchema, type CheckoutInput } from '../../../lib/schemas/auth'

export default function CheckoutPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const { items: cartItems, total, clearCart } = useCart()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [items, setItems] = useState<any[]>([])

  const [translations, setTranslations] = useState<any>({})

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CheckoutInput>({
    resolver: zodResolver(CheckoutSchema),
    mode: 'onTouched',
    defaultValues: {
      country: 'Maroc'
    }
  })

  // Synchronize cart items
  useEffect(() => {
    setItems(cartItems)
  }, [cartItems])

  // Load translations
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

  // Pre-fill form when profile/user changes
  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName || user?.user_metadata?.firstName || '',
        lastName: profile.lastName || user?.user_metadata?.lastName || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        postalCode: profile.postalCode || '',
        country: profile.country || 'Maroc',
      })
    } else if (user) {
      // Fallback if authenticated but no profile yet
      reset({
        firstName: user.user_metadata?.firstName || '',
        lastName: user.user_metadata?.lastName || '',
        email: user.email || '',
        country: 'Maroc',
      })
    }
  }, [profile, user, reset])

  const onSubmit = async (data: CheckoutInput) => {
    setLoading(true)
    setGlobalError('')

    try {
      if (!user) {
        setGlobalError(translations.checkout?.required_field || 'Vous devez être connecté')
        setLoading(false)
        return
      }

      if (items.length === 0) {
        setGlobalError(translations.cart?.empty || 'Votre panier est vide')
        setLoading(false)
        return
      }

      // Clean items payload for API
      const cleanedItems = items.map((item) => ({
        serviceId: item.serviceId || item.service_id,
        title: item.title,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity),
        id: item.id,
      }))

      // Get session
      const { data: { session } } = await supabase.auth.getSession()
      let token = session?.access_token

      // Refresh if required
      if (!token) {
        const { data: { session: refreshedSession } } = await supabase.auth.refreshSession()
        token = refreshedSession?.access_token
        if (!token) {
          setGlobalError('Session expirée, veuillez vous reconnecter')
          setLoading(false)
          return
        }
      }

      const orderData = {
        items: cleanedItems,
        total: parseFloat(total.toFixed(2)),
        shippingInfo: data, // Form is validated via RHF + Zod
      }

      // Create Order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        let errorMessage = responseData.error || 'Erreur lors de la création de la commande'
        if (responseData.details) {
          errorMessage += ': ' + JSON.stringify(responseData.details)
        }
        setGlobalError(errorMessage)
        return
      }

      // Clear cart & redirect
      clearCart()
      router.push(`/${locale}/order-confirmation/${responseData.order.id}`)
    } catch (err: any) {
      setGlobalError(err.message || 'Erreur lors du traitement de la commande')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {translations.cart?.empty || 'Votre panier est vide'}
          </h1>
          <p className="text-gray-600 mb-8">
            {translations.cart?.continue_shopping || 'Continuer vos achats'}
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
          {translations.checkout?.title || 'Passer la Commande'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {globalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  <p className="font-semibold mb-2">❌ {globalError}</p>
                  <p className="text-sm">{translations.checkout?.verify_fields || 'Vérifiez que tous les champs sont remplis correctement.'}</p>
                </div>
              )}

              {/* Shipping Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                <div className="flex items-center gap-2 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {translations.checkout?.shipping_info || 'Informations de Livraison'}
                  </h2>
                  <span className="text-red-500 font-bold text-lg">*</span>
                  <span className="text-sm text-gray-600 ml-auto">
                    {translations.checkout?.required_fields || 'Champs obligatoires'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.checkout?.first_name || 'Prénom'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={translations.checkout?.first_name || 'Prénom'}
                      {...register('firstName')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.checkout?.last_name || 'Nom'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={translations.checkout?.last_name || 'Nom'}
                      {...register('lastName')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.checkout?.email || 'Email'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder={translations.checkout?.email || 'Email'}
                      {...register('email')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.checkout?.phone || 'Téléphone'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder={translations.checkout?.phone_placeholder || '+212 6XX XXX XXX'}
                      {...register('phone')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{translations.checkout?.phone_format_hint || 'Format: +[code pays] [numéro] ou [numéro local]'}</p>
                  </div>

                  {/* Address */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.checkout?.address || 'Adresse'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={translations.checkout?.address || 'Adresse'}
                      {...register('address')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>
                    )}
                  </div>

                  {/* City */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.checkout?.city || 'Ville'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={translations.checkout?.city || 'Ville'}
                      {...register('city')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>
                    )}
                  </div>

                  {/* Postal Code */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.checkout?.postal_code || 'Code Postal'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={translations.checkout?.postal_code || 'Code Postal'}
                      {...register('postalCode')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.postalCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-xs text-red-500">{errors.postalCode.message}</p>
                    )}
                  </div>

                  {/* Country */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.checkout?.country || 'Pays'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      {...register('country')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white ${errors.country ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                      <option value="Morocco">{translations.checkout?.countries?.morocco || 'Maroc'}</option>
                      <option value="Senegal">{translations.checkout?.countries?.senegal || 'Sénégal'}</option>
                      <option value="Ivory Coast">{translations.checkout?.countries?.ivory_coast || "Côte d'Ivoire"}</option>
                      <option value="Cameroon">{translations.checkout?.countries?.cameroon || 'Cameroun'}</option>
                      <option value="Mali">{translations.checkout?.countries?.mali || 'Mali'}</option>
                      <option value="Burkina Faso">{translations.checkout?.countries?.burkina_faso || 'Burkina Faso'}</option>
                      <option value="Other">{translations.checkout?.countries?.other || 'Autre'}</option>
                    </select>
                    {errors.country && (
                      <p className="mt-1 text-xs text-red-500">{errors.country.message}</p>
                    )}
                  </div>
                </div>

                {/* Delivery Notes */}
                <div className="mt-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">📦 {translations.checkout?.delivery_info || 'Délai de livraison'}:</span>
                    <br />
                    {translations.checkout?.delivery_senegal || '• Sénégal: 2-3 jours ouvrables'}
                    <br />
                    {translations.checkout?.delivery_morocco || '• Maroc: 3-5 jours ouvrables'}
                    <br />
                    {translations.checkout?.delivery_other || '• Autres pays: 7-14 jours ouvrables'}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition"
              >
                {loading ? (translations.checkout?.processing || 'Traitement...') : translations.checkout?.confirm_order || 'Confirmer la Commande'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {translations.checkout?.order_summary || 'Résumé de la Commande'}
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-gray-600">
                    <span>
                      {item.title} x {item.quantity}
                    </span>
                    <span>{(item.price * item.quantity).toFixed(2)} DH</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>{translations.checkout?.order_summary || 'Total'}:</span>
                  <span>{total.toFixed(2)} DH</span>
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                {translations.checkout?.estimated_delivery || 'Livraison estimée'}: 3-5 jours ouvrables
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
