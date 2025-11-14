import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { resetPassword } from '@/lib/supabase/enhanced-auth-service'

const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valider les données
    const validatedData = ResetPasswordSchema.parse(body)

    const result = await resetPassword(validatedData.token, validatedData.password)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: result.message },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la réinitialisation' },
      { status: 400 }
    )
  }
}
