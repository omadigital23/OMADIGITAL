import { NextRequest, NextResponse } from 'next/server'
import { updateUserEmail } from '@/lib/supabase/enhanced-auth-service'

function getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || '0.0.0.0'
    return ip.trim()
}

export async function POST(request: NextRequest) {
    try {
        const { newEmail, locale = 'fr' } = await request.json()

        if (!newEmail) {
            return NextResponse.json(
                { error: 'Nouvel email requis', success: false },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(newEmail)) {
            return NextResponse.json(
                { error: 'Format email invalide', success: false },
                { status: 400 }
            )
        }

        // Get client info for rate limiting
        const ipAddress = getClientIp(request)
        const userAgent = request.headers.get('user-agent') || undefined

        // Build redirect URL
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://omadigital.net'
        const redirectTo = `${origin}/${locale}/auth/verify`

        // Update email (will send verification)
        const result = await updateUserEmail(
            newEmail,
            redirectTo,
            ipAddress,
            userAgent
        )

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
        console.error('Change email error:', error)
        return NextResponse.json(
            { error: error.message || 'Erreur lors du changement d\'email', success: false },
            { status: 500 }
        )
    }
}
