import { NextRequest, NextResponse } from 'next/server'
import { reauthenticateUser } from '@/lib/supabase/enhanced-auth-service'

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json()

        if (!password) {
            return NextResponse.json(
                { error: 'Mot de passe requis', success: false },
                { status: 400 }
            )
        }

        // Reauthenticate user
        const result = await reauthenticateUser(password)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error, success: false },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { message: result.message, success: true },
            { status: 200 }
        )
    } catch (error: any) {
        console.error('Reauthentication error:', error)
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la réauthentification', success: false },
            { status: 500 }
        )
    }
}
