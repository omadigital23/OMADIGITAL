import { NextRequest, NextResponse } from 'next/server'
import { SignupSchema } from '../../../../lib/schemas/auth'
import { signUpEnhanced } from '../../../../lib/supabase/enhanced-auth-service'

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || '0.0.0.0'
  return ip.trim()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valider les données
    const validatedData = SignupSchema.parse(body)

    // Récupérer les infos du client
    const ipAddress = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || undefined

    // Créer l'utilisateur (avec rate limiting et logging)
    const result = await signUpEnhanced(
      validatedData.email,
      validatedData.password,
      validatedData.firstName,
      validatedData.lastName,
      ipAddress,
      userAgent
    )

    if (!result.success) {
      console.error('Signup Failed - Detail:', result.error);
      return NextResponse.json(
        { error: result.error, debug: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        message: 'Inscription réussie. Vérifiez votre email pour confirmer votre compte.',
        user: result.user,
        requiresEmailVerification: true
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Sign up error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'inscription' },
      { status: 400 }
    )
  }
}
