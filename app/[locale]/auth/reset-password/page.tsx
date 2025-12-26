'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../../lib/supabase/client'

export default function ResetPasswordPage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const locale = params.locale as string
    const [translations, setTranslations] = useState<any>({})
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [isValidSession, setIsValidSession] = useState<boolean | null>(null)

    useEffect(() => {
        const loadTranslations = async () => {
            try {
                const response = await fetch(`/locales/${locale}/common.json`)
                const data = await response.json()
                setTranslations(data)
            } catch (err) {
                console.error('Error loading translations:', err)
            }
        }
        loadTranslations()
    }, [locale])

    // Check if we have a valid recovery session
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            // Supabase sets a session when user clicks the reset link
            setIsValidSession(!!session)
        }
        checkSession()

        // Listen for auth state changes (when user clicks the reset link)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsValidSession(true)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const t = translations.auth || {}

        // Validate passwords
        if (password.length < 8) {
            setError(t.password_min_length || 'Le mot de passe doit contenir au moins 8 caractères')
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError(t.passwords_not_match || 'Les mots de passe ne correspondent pas')
            setLoading(false)
            return
        }

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password,
            })

            if (updateError) {
                setError(updateError.message)
            } else {
                setSuccess(true)
                // Sign out after password reset
                await supabase.auth.signOut()
                // Redirect to home after 3 seconds
                setTimeout(() => {
                    router.push(`/${locale}`)
                }, 3000)
            }
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue')
        } finally {
            setLoading(false)
        }
    }

    const t = translations.auth || {}

    // Loading state
    if (isValidSession === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
            </div>
        )
    }

    // Invalid or expired token
    if (!isValidSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="mb-6">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {t.invalid_token || 'Lien invalide ou expiré'}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {t.token_expired || 'Ce lien a expiré. Veuillez en demander un nouveau.'}
                    </p>
                    <Link
                        href={`/${locale}/auth/forgot-password`}
                        className="inline-flex items-center justify-center w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-all"
                    >
                        {t.forgot_password || 'Mot de passe oublié ?'}
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link href={`/${locale}`} className="inline-block mb-6">
                            <img src="/images/logo.webp" alt="OMA Digital" className="h-12 mx-auto" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {t.reset_password_title || 'Créer un nouveau mot de passe'}
                        </h1>
                        <p className="mt-2 text-gray-600">
                            {t.reset_password_description || 'Entrez votre nouveau mot de passe ci-dessous.'}
                        </p>
                    </div>

                    {success ? (
                        <div className="text-center">
                            <div className="mb-6">
                                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                {t.reset_password_success || 'Mot de passe réinitialisé !'}
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {t.welcome_back || 'Vous pouvez maintenant vous connecter.'}
                            </p>
                            <Link
                                href={`/${locale}`}
                                className="inline-flex items-center justify-center w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-all"
                            >
                                {t.sign_in || 'Se connecter'}
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    {t.new_password || 'Nouveau mot de passe'}
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    {t.password_min_length || 'Minimum 8 caractères'}
                                </p>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    {t.confirm_password || 'Confirmer le mot de passe'}
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 focus:ring-4 focus:ring-orange-200 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? (t.processing || 'Traitement...') : (t.reset_password || 'Réinitialiser le mot de passe')}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
