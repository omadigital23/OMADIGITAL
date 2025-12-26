'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const params = useParams()
    const router = useRouter()
    const locale = params.locale as string
    const [translations, setTranslations] = useState<any>({})
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, locale }),
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(true)
            } else {
                setError(data.error || translations.auth?.login_error)
            }
        } catch (err) {
            setError(translations.auth?.login_error || 'Une erreur est survenue')
        } finally {
            setLoading(false)
        }
    }

    const t = translations.auth || {}

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
                            {t.forgot_password_title || 'Réinitialiser votre mot de passe'}
                        </h1>
                        <p className="mt-2 text-gray-600">
                            {t.forgot_password_description || 'Entrez votre email pour recevoir un lien de réinitialisation.'}
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
                                {t.email_sent || 'Email envoyé !'}
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {t.check_your_email || 'Vérifiez votre boîte mail'}
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                {t.forgot_password_success || 'Si cet email existe, vous recevrez un lien de réinitialisation.'}
                            </p>
                            <Link
                                href={`/${locale}`}
                                className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                {t.back_to_login || 'Retour à la connexion'}
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
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    {t.email || 'Email'}
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="votre@email.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 focus:ring-4 focus:ring-orange-200 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? (t.sending || 'Envoi...') : (t.reset_password || 'Réinitialiser le mot de passe')}
                            </button>

                            <div className="text-center">
                                <Link
                                    href={`/${locale}`}
                                    className="text-gray-600 hover:text-gray-900 text-sm"
                                >
                                    {t.back_to_login || 'Retour à la connexion'}
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
