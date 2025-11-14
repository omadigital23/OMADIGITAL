'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useParams } from 'next/navigation'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signIn, signUp } = useAuth()
  const params = useParams()
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
          setError(locale === 'fr' ? 'Tous les champs sont obligatoires' : 'All fields are required')
          setLoading(false)
          return
        }
        await signUp(formData.email, formData.password, formData.firstName, formData.lastName)
      } else {
        await signIn(formData.email, formData.password)
      }
      onClose()
    } catch (err: any) {
      setError(err.message || (locale === 'fr' ? 'Erreur lors de la connexion' : 'Login error'))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {isSignUp
              ? locale === 'fr'
                ? 'Créer un compte'
                : 'Create Account'
              : locale === 'fr'
              ? 'Se connecter'
              : 'Sign In'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* Contenu */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {isSignUp && (
            <>
              <input
                type="text"
                name="firstName"
                placeholder={locale === 'fr' ? 'Prénom' : 'First Name'}
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                name="lastName"
                placeholder={locale === 'fr' ? 'Nom' : 'Last Name'}
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <input
            type="password"
            name="password"
            placeholder={locale === 'fr' ? 'Mot de passe' : 'Password'}
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
          >
            {loading
              ? locale === 'fr'
                ? 'Traitement...'
                : 'Processing...'
              : isSignUp
              ? locale === 'fr'
                ? 'Créer un compte'
                : 'Create Account'
              : locale === 'fr'
              ? 'Se connecter'
              : 'Sign In'}
          </button>
        </form>

        {/* Lien pour basculer */}
        <div className="px-6 pb-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
              setFormData({ email: '', password: '', firstName: '', lastName: '' })
            }}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            {isSignUp
              ? locale === 'fr'
                ? 'Déjà inscrit ? Se connecter'
                : 'Already have an account? Sign In'
              : locale === 'fr'
              ? 'Pas encore inscrit ? Créer un compte'
              : 'Don\'t have an account? Create one'}
          </button>
        </div>
      </div>
    </div>
  )
}
