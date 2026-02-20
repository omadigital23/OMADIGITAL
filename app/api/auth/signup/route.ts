import { NextRequest, NextResponse } from 'next/server'
import { SignupSchema } from '../../../../lib/schemas/auth'
import { signUpEnhanced } from '../../../../lib/supabase/enhanced-auth-service'
import { getClientIp, handleApiError } from '../../../../lib/api-utils'

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
      return NextResponse.json(
        { error: result.error },
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
  } catch (error) {
    return handleApiError(error, 'Erreur lors de l\'inscription')
  }
}
