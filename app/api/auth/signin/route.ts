import { NextRequest, NextResponse } from 'next/server'
import { LoginSchema } from '../../../../lib/schemas/auth'
import { signInEnhanced } from '../../../../lib/supabase/enhanced-auth-service'
import { getClientIp, handleApiError } from '../../../../lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valider les données
    const validatedData = LoginSchema.parse(body)

    // Récupérer les infos du client
    const ipAddress = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || undefined

    // Connecter l'utilisateur (avec rate limiting et logging)
    const result = await signInEnhanced(
      validatedData.email,
      validatedData.password,
      ipAddress,
      userAgent
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        message: 'Connexion réussie',
        user: result.user,
        session: result.session
      },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error, 'Erreur lors de la connexion')
  }
}
