import { NextRequest, NextResponse } from 'next/server'
import { resetPasswordForEmailNative } from '@/lib/supabase/enhanced-auth-service'

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || '0.0.0.0'
  return ip.trim()
}

export async function POST(request: NextRequest) {
  try {
    const { email, locale = 'fr' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    // Get client info for rate limiting
    const ipAddress = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || undefined

    // Build redirect URL for password reset page
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://omadigital.net'
    const redirectTo = `${origin}/${locale}/auth/reset-password`

    // Use native Supabase function that sends email automatically
    const result = await resetPasswordForEmailNative(
      email,
      redirectTo,
      ipAddress,
      userAgent
    )

    // Always return success for security (don't reveal if email exists)
    return NextResponse.json(
      { message: result.message, success: true },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Password reset error:', error)
    // Still return success for security
    return NextResponse.json(
      { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.', success: true },
      { status: 200 }
    )
  }
}
