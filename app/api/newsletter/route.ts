import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, service } = await request.json()

    if (!fullName || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Insert into blog_subscribers table
    const { data, error } = await supabaseAdmin
      .from('blog_subscribers')
      .insert([
        {
          email: email,
          status: 'active',
          source: 'newsletter_form',
          segment: service || 'general'
        }
      ])

    if (error) {
      console.error('Newsletter subscription error:', error)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Email already subscribed' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Subscription failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Newsletter API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}