import { NextRequest, NextResponse } from 'next/server'
import { createPasswordReset } from '@/lib/supabase/enhanced-auth-service'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    const result = await createPasswordReset(email)

    // Always return success for security (don't reveal if email exists)
    return NextResponse.json(
      { message: result.message },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la demande' },
      { status: 400 }
    )
  }
}
