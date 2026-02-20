'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../lib/contexts/AuthContext'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginSchema, SignupSchema, type LoginInput, type SignupInput } from '../lib/schemas/auth'

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
  const [globalError, setGlobalError] = useState('')

  // Configure React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SignupInput | LoginInput>({
    resolver: zodResolver(isSignUp ? SignupSchema : LoginSchema),
    mode: 'onSubmit',
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

  // Reset form when toggling between sign in and sign up
  useEffect(() => {
    reset()
    setGlobalError('')
  }, [isSignUp, reset])

  const onSubmit = async (data: SignupInput | LoginInput) => {
    setLoading(true)
    setGlobalError('')

    try {
      if (isSignUp) {
        const signupData = data as SignupInput
        await signUp(signupData.email, signupData.password, signupData.firstName, signupData.lastName)
      } else {
        const loginData = data as LoginInput
        await signIn(loginData.email, loginData.password)
      }
      onClose()
    } catch (err: any) {
      setGlobalError(err.message || translations.auth?.login_error || 'Erreur lors de la connexion')
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
      <div className="bg-white rounded-2xl shadow-xl max-w-md md:max-w-lg w-full overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-2xl font-bold text-white">
            {isSignUp
              ? t.create_account || 'Créer un compte'
              : t.sign_in || 'Se connecter'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100 text-2xl transition-colors"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* Contenu */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {globalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {globalError}
            </div>
          )}

          {isSignUp && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder={t.first_name || 'Prénom'}
                  {...register('firstName')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${(errors as any).firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {(errors as any).firstName && (
                  <p className="mt-1 text-xs text-red-500">{(errors as any).firstName.message}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  placeholder={t.last_name || 'Nom'}
                  {...register('lastName')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${(errors as any).lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {(errors as any).lastName && (
                  <p className="mt-1 text-xs text-red-500">{(errors as any).lastName.message}</p>
                )}
              </div>
            </div>
          )}

          <div>
            <input
              type="email"
              placeholder={t.email || 'Email'}
              {...register('email')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder={t.password || 'Mot de passe'}
              {...register('password')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}

            {!isSignUp && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t.forgot_password || 'Mot de passe oublié ?'}
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition-all focus:ring-4 focus:ring-blue-200"
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
                className="w-full border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 font-semibold transition-all flex items-center justify-center gap-2"
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
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:text-blue-700 font-semibold"
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
