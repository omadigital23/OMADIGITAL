'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../../../lib/supabase/client'

export default function AuthCallbackPage() {
    const router = useRouter()
    const params = useParams()
    const locale = (params.locale as string) || 'fr'
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Supabase gère automatiquement le hash fragment via detectSessionInUrl
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError) {
                    console.error('Session error:', sessionError)
                    setError(sessionError.message)
                    setLoading(false)
                    return
                }

                if (session?.user) {

                    // Vérifier si le profil utilisateur existe, sinon le créer
                    const { data: existingProfile } = await supabase
                        .from('users')
                        .select('id')
                        .eq('id', session.user.id)
                        .single()

                    if (!existingProfile) {
                        // Créer le profil utilisateur pour les connexions OAuth
                        const userMetadata = session.user.user_metadata || {}
                        const fullName = userMetadata.full_name || userMetadata.name || ''
                        const nameParts = fullName.split(' ')

                        await supabase.from('users').insert({
                            id: session.user.id,
                            email: session.user.email,
                            firstname: nameParts[0] || '',
                            lastname: nameParts.slice(1).join(' ') || '',
                        })
                    }

                    // Rediriger vers la page d'accueil
                    router.push(`/${locale}`)
                } else {
                    // Pas de session, attendre que Supabase traite le hash
                    // Le listener onAuthStateChange dans AuthContext va gérer ça
                    setTimeout(() => {
                        router.push(`/${locale}`)
                    }, 1000)
                }
            } catch (err: any) {
                console.error('OAuth callback error:', err)
                setError(err.message)
                setLoading(false)
            }
        }

        handleCallback()
    }, [router])

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Erreur de connexion
                    </h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push(`/${locale}`)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                    >
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 text-lg">Connexion en cours...</p>
            </div>
        </div>
    )
}
