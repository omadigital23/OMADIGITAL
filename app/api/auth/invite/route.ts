import { NextRequest, NextResponse } from 'next/server'
import { inviteUserByEmail } from '../../../../lib/supabase/enhanced-auth-service'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
    try {
        const { email, role = 'user', locale = 'fr' } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email requis', success: false },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Format email invalide', success: false },
                { status: 400 }
            )
        }

        // Get authorization header to verify admin
        const authHeader = request.headers.get('authorization')
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Non autorisé', success: false },
                { status: 401 }
            )
        }

        // Verify the requesting user is an admin
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Non autorisé', success: false },
                { status: 401 }
            )
        }

        // Check if user is admin (you can customize this check based on your user roles)
        const { data: userData } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userData?.role !== 'admin') {
            return NextResponse.json(
                { error: 'Accès refusé. Droits administrateur requis.', success: false },
                { status: 403 }
            )
        }

        // Build redirect URL
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://omadigital.net'
        const redirectTo = `${origin}/${locale}/auth/accept-invite`

        // Send invitation
        const result = await inviteUserByEmail(email, redirectTo, { role })

        if (!result.success) {
            return NextResponse.json(
                { error: result.error, success: false },
                { status: 400 }
            )
        }

        return NextResponse.json(
            {
                message: result.message,
                success: true,
                user: result.user
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error('Invite user error:', error)
        return NextResponse.json(
            { error: error.message || 'Erreur lors de l\'invitation', success: false },
            { status: 500 }
        )
    }
}
