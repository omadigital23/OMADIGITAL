'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../../lib/supabase/client'

export default function VerifyPage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const locale = params.locale as string
    const [translations, setTranslations] = useState<any>({})
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')

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

    useEffect(() => {
        // Check for verification in URL hash (Supabase redirects with hash)
        const handleVerification = async () => {
            // Wait a moment for Supabase to process the URL
            await new Promise(resolve => setTimeout(resolve, 1000))

            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                setStatus('error')
                setMessage(translations.auth?.verify_email_error || 'Erreur lors de la vérification')
                return
            }

            if (session) {
                setStatus('success')
                setMessage(translations.auth?.verify_email_success || 'Email vérifié avec succès !')
                // Redirect to home after 3 seconds
                setTimeout(() => {
                    router.push(`/${locale}`)
                }, 3000)
            } else {
                // No session, might be email change verification
                setStatus('success')
                setMessage(translations.auth?.verify_email_success || 'Vérification réussie !')
                setTimeout(() => {
                    router.push(`/${locale}`)
                }, 3000)
            }
        }

        handleVerification()
    }, [locale, router, translations])

    const t = translations.auth || {}

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <Link href={`/${locale}`} className="inline-block mb-6">
                    <img src="/images/logo.webp" alt="OMA Digital" className="h-12 mx-auto" />
                </Link>

                {status === 'loading' && (
                    <>
                        <div className="mb-6">
                            <div className="mx-auto w-16 h-16 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
                            </div>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            {t.verify_email_title || 'Vérification en cours...'}
                        </h2>
                        <p className="text-gray-600">
                            {t.processing || 'Traitement...'}
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="mb-6">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            {t.verify_email_success || 'Vérification réussie !'}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {message}
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Redirection automatique...
                        </p>
                        <Link
                            href={`/${locale}`}
                            className="inline-flex items-center justify-center w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-all"
                        >
                            {t.back_to_login || "Aller à l'accueil"}
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="mb-6">
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            {t.verify_email_error || 'Erreur de vérification'}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {message || t.invalid_token || 'Le lien est invalide ou a expiré.'}
                        </p>
                        <Link
                            href={`/${locale}`}
                            className="inline-flex items-center justify-center w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-all"
                        >
                            {t.back_to_login || "Retour à l'accueil"}
                        </Link>
                    </>
                )}
            </div>
        </div>
    )
}
