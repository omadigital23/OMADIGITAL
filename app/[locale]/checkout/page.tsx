'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useCart } from '../../../lib/contexts/CartContext'
import { useAuth } from '../../../lib/contexts/AuthContext'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase/client'

export default function CheckoutPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const { items: cartItems, total, clearCart } = useCart()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState<any[]>([])

  // Charger les traductions
  const [translations, setTranslations] = useState<any>({})

  // Synchroniser les items du panier
  useEffect(() => {
    console.log('CartItems from context:', cartItems)
    setItems(cartItems)
  }, [cartItems])

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

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Maroc',
  })

  // Mettre à jour le formulaire quand le profil change
  useEffect(() => {
    if (profile) {
      setFormData({
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
      // Fallback si pas de profil mais utilisateur authentifié
      setFormData((prev) => ({
        ...prev,
        firstName: user.user_metadata?.firstName || '',
        lastName: user.user_metadata?.lastName || '',
        email: user.email || '',
        country: 'Maroc',
      }))
    }
  }, [profile, user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('=== DÉBUT VALIDATION FORMULAIRE ===')
      console.log('FormData:', formData)
      console.log('User:', user)
      console.log('Items:', items)
      console.log('Items length:', items.length)
      console.log('User exists:', !!user)

      if (!user) {
        console.error('❌ User not found')
        setError(translations.checkout?.required_field || 'Vous devez être connecté')
        setLoading(false)
        return
      }

      if (items.length === 0) {
        console.error('❌ Cart is empty')
        setError(translations.cart?.empty || 'Votre panier est vide')
        setLoading(false)
        return
      }

      // Valider les champs requis (avec trim pour les espaces)
      const requiredFields = [
        { value: formData.firstName.trim(), name: 'firstName' },
        { value: formData.lastName.trim(), name: 'lastName' },
        { value: formData.email.trim(), name: 'email' },
        { value: formData.phone.trim(), name: 'phone' },
        { value: formData.address.trim(), name: 'address' },
        { value: formData.city.trim(), name: 'city' },
        { value: formData.postalCode.trim(), name: 'postalCode' },
        { value: formData.country.trim(), name: 'country' },
      ]

      console.log('Validation des champs:', requiredFields)
      console.log('Champs avec valeurs:', requiredFields.map(f => ({ name: f.name, value: f.value, isEmpty: !f.value || f.value.length === 0 })))

      const emptyField = requiredFields.find((field) => !field.value || field.value.length === 0)
      if (emptyField) {
        console.error('❌ Champ vide trouvé:', emptyField)
        setError(`${emptyField.name} est obligatoire`)
        setLoading(false)
        return
      }

      console.log('✅ Tous les champs sont valides')

      // Valider l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError(translations.checkout?.invalid_email || 'Email invalide')
        setLoading(false)
        return
      }

      // Valider le téléphone (accepte les formats internationaux)
      const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        setError(translations.checkout?.invalid_phone || 'Téléphone invalide')
        setLoading(false)
        return
      }

      // Nettoyer les items pour l'envoi
      console.log('Items avant nettoyage:', items)

      const cleanedItems = items.map((item) => {
        console.log('Item à nettoyer:', item)
        return {
          serviceId: item.serviceId || item.service_id,
          title: item.title,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity),
          id: item.id,
        }
      })

      console.log('Items nettoyés:', cleanedItems)
      console.log('FormData:', formData)
      console.log('Total:', total)

      // Récupérer le token de session
      console.log('Récupération du token de session...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('Session:', session)
      console.log('Session error:', sessionError)

      let token = session?.access_token

      // Si pas de token dans la session, essayer de se reconnecter automatiquement
      if (!token) {
        console.log('⚠️ Token not found in session, trying to refresh...')
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
        console.log('Refreshed session:', refreshedSession)
        console.log('Refresh error:', refreshError)

        token = refreshedSession?.access_token

        if (!token) {
          console.error('❌ Token still not found after refresh')
          setError('Session expirée, veuillez vous reconnecter')
          setLoading(false)
          return
        }
      }

      console.log('✅ Token trouvé:', token.substring(0, 20) + '...')

      const orderData = {
        items: cleanedItems,
        total: parseFloat(total.toFixed(2)),
        shippingInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
      }

      console.log('Données envoyées:', orderData)

      // Créer la commande
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (!response.ok) {
        // Afficher les détails de l'erreur de validation
        let errorMessage = data.error || 'Erreur lors de la création de la commande'
        if (data.details) {
          errorMessage += ': ' + JSON.stringify(data.details)
        }
        console.error('Erreur commande:', errorMessage, data)
        setError(errorMessage)
        return
      }

      // Vider le panier et rediriger
      clearCart()
      router.push(`/${locale}/order-confirmation/${data.order.id}`)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du traitement de la commande')
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
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  <p className="font-semibold mb-2">❌ {error}</p>
                  <p className="text-sm">{translations.checkout?.verify_fields || 'Vérifiez que tous les champs sont remplis correctement.'}</p>
                </div>
              )}

              {/* Informations de Livraison */}
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
                  {/* Prénom */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.checkout?.first_name || 'Prénom'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder={translations.checkout?.first_name || 'Prénom'}
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* Nom */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.checkout?.last_name || 'Nom'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder={translations.checkout?.last_name || 'Nom'}
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* Email */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.checkout?.email || 'Email'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder={translations.checkout?.email || 'Email'}
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* Téléphone */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.checkout?.phone || 'Téléphone'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder={translations.checkout?.phone_placeholder || '+212 6XX XXX XXX'}
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">{translations.checkout?.phone_format_hint || 'Format: +[code pays] [numéro] ou [numéro local]'}</p>
                  </div>

                  {/* Adresse */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.checkout?.address || 'Adresse'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      placeholder={translations.checkout?.address || 'Adresse'}
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* Ville */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.checkout?.city || 'Ville'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder={translations.checkout?.city || 'Ville'}
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* Code Postal */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.checkout?.postal_code || 'Code Postal'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      placeholder={translations.checkout?.postal_code || 'Code Postal'}
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* Pays */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.checkout?.country || 'Pays'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                    >
                      <option value="Morocco">{translations.checkout?.countries?.morocco || 'Maroc'}</option>
                      <option value="Senegal">{translations.checkout?.countries?.senegal || 'Sénégal'}</option>
                      <option value="Ivory Coast">{translations.checkout?.countries?.ivory_coast || "Côte d'Ivoire"}</option>
                      <option value="Cameroon">{translations.checkout?.countries?.cameroon || 'Cameroun'}</option>
                      <option value="Mali">{translations.checkout?.countries?.mali || 'Mali'}</option>
                      <option value="Burkina Faso">{translations.checkout?.countries?.burkina_faso || 'Burkina Faso'}</option>
                      <option value="Other">{translations.checkout?.countries?.other || 'Autre'}</option>
                    </select>
                  </div>
                </div>

                {/* Note sur les délais de livraison */}
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
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? (translations.checkout?.processing || 'Traitement...') : translations.checkout?.confirm_order || 'Confirmer la Commande'}
              </button>
            </form>
          </div>

          {/* Résumé de la Commande */}
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
