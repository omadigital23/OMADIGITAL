import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/fr'

    if (code) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            // Vérifier si le profil utilisateur existe, sinon le créer
            const { data: existingProfile } = await supabase
                .from('users')
                .select('id')
                .eq('id', data.user.id)
                .single()

            if (!existingProfile) {
                // Créer le profil utilisateur pour les connexions OAuth
                const userMetadata = data.user.user_metadata || {}
                await supabase.from('users').insert({
                    id: data.user.id,
                    email: data.user.email,
                    firstname: userMetadata.full_name?.split(' ')[0] || userMetadata.name?.split(' ')[0] || '',
                    lastname: userMetadata.full_name?.split(' ').slice(1).join(' ') || userMetadata.name?.split(' ').slice(1).join(' ') || '',
                })
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // En cas d'erreur, rediriger vers la page d'accueil
    return NextResponse.redirect(`${origin}/fr?error=auth_callback_error`)
}
