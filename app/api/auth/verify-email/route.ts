import { NextRequest, NextResponse } from 'next/server'
import { verifyEmail } from '@/lib/supabase/enhanced-auth-service'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token requis' },
        { status: 400 }
      )
    }

    const result = await verifyEmail(token)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Email vérifié avec succès',
        userId: result.userId 
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la vérification' },
      { status: 400 }
    )
  }
}
