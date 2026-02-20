import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '../../../lib/supabase/admin'
import { handleApiError } from '../../../lib/api-utils'

const newsletterSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  service: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = newsletterSchema.parse(body)

    // Insert into blog_subscribers table
    const { data, error } = await supabaseAdmin
      .from('blog_subscribers')
      .insert([
        {
          email: validatedData.email,
          status: 'active',
          source: 'newsletter_form',
          segment: validatedData.service || 'general'
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
    return handleApiError(error, 'Newsletter subscription failed')
  }
}