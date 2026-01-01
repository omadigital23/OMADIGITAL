'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MagicLinkPage() {
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
            const response = await fetch('/api/auth/magic-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, locale }),
            })

            const data = await response.json()

            if (data.success) {
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
                            {t.magic_link_title || 'Connexion sans mot de passe'}
                        </h1>
                        <p className="mt-2 text-gray-600">
                            {t.magic_link_description || 'Recevez un lien de connexion unique par email.'}
                        </p>
                    </div>

                    {success ? (
                        <div className="text-center">
                            <div className="mb-6">
                                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                {t.email_sent || 'Email envoyé !'}
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {t.magic_link_success || 'Un lien de connexion a été envoyé à votre email.'}
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                {t.check_your_email || 'Vérifiez votre boîte mail et cliquez sur le lien pour vous connecter.'}
                            </p>
                            <Link
                                href={`/${locale}`}
                                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                {t.back_to_login || "Retour à l'accueil"}
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="votre@email.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? (t.sending || 'Envoi...') : (t.magic_link_btn || 'Envoyer le lien magique')}
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">
                                        {t.or_use_password || 'Ou utiliser un mot de passe'}
                                    </span>
                                </div>
                            </div>

                            <div className="text-center">
                                <Link
                                    href={`/${locale}`}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    {t.sign_in || 'Se connecter avec mot de passe'}
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
