'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../lib/contexts/AuthContext'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signIn, signUp } = useAuth()
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const [translations, setTranslations] = useState<any>({})
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  })

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (isSignUp) {
        if (!formData.firstName || !formData.lastName) {
          setError(translations.auth?.all_fields_required || 'Tous les champs sont obligatoires')
          setLoading(false)
          return
        }
        await signUp(formData.email, formData.password, formData.firstName, formData.lastName)
      } else {
        await signIn(formData.email, formData.password)
      }
      onClose()
    } catch (err: any) {
      setError(err.message || translations.auth?.login_error || 'Erreur lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    onClose()
    router.push(`/${locale}/auth/forgot-password`)
  }

  const handleMagicLink = () => {
    onClose()
    router.push(`/${locale}/auth/magic-link`)
  }

  if (!isOpen) return null

  const t = translations.auth || {}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-orange-500 to-orange-600">
          <h2 className="text-2xl font-bold text-white">
            {isSignUp
              ? t.create_account || 'Créer un compte'
              : t.sign_in || 'Se connecter'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-orange-100 text-2xl transition-colors"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* Contenu */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {isSignUp && (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="firstName"
                placeholder={t.first_name || 'Prénom'}
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
              <input
                type="text"
                name="lastName"
                placeholder={t.last_name || 'Nom'}
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          <input
            type="email"
            name="email"
            placeholder={t.email || 'Email'}
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />

          <div>
            <input
              type="password"
              name="password"
              placeholder={t.password || 'Mot de passe'}
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
            {!isSignUp && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  {t.forgot_password || 'Mot de passe oublié ?'}
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 font-semibold transition-all focus:ring-4 focus:ring-orange-200"
          >
            {loading
              ? t.processing || 'Traitement...'
              : isSignUp
                ? t.create_account || 'Créer un compte'
                : t.sign_in || 'Se connecter'}
          </button>

          {/* Magic Link Option */}
          {!isSignUp && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    {t.or_use_magic_link || 'Ou utiliser un lien magique'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleMagicLink}
                className="w-full border-2 border-orange-600 text-orange-600 px-6 py-3 rounded-lg hover:bg-orange-50 font-semibold transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t.magic_link || 'Connexion par lien magique'}
              </button>
            </>
          )}
        </form>

        {/* Lien pour basculer */}
        <div className="px-6 pb-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
              setFormData({ email: '', password: '', firstName: '', lastName: '' })
            }}
            className="text-orange-600 hover:text-orange-700 font-semibold"
          >
            {isSignUp
              ? t.already_registered || 'Déjà inscrit ? Se connecter'
              : t.not_registered || 'Pas encore inscrit ? Créer un compte'}
          </button>
        </div>
      </div>
    </div>
  )
}
