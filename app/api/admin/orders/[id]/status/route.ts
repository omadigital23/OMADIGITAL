import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json()

    if (!['confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', params.id)

    if (error) {
      console.error('Error updating order status:', error)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in admin order status API:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
