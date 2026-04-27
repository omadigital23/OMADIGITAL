import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, buildLeadNotificationEmail } from '@/lib/email';
import { sendWhatsAppNotification, buildLeadWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, business, message, service } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const lead = { name, email, phone, business, message, service };

    // 1. Store in Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      await supabase.from('leads').insert({
        name,
        email,
        phone,
        business_type: business || null,
        message: message || null,
        service: service || null,
      });
    }

    // 2. Send email notification to admin
    const supportEmail = process.env.SMTP_SUPPORT_EMAIL || process.env.SMTP_FROM_EMAIL;
    if (supportEmail) {
      const { subject, html } = buildLeadNotificationEmail(lead);
      sendEmail({ to: supportEmail, subject, html }).catch(console.error);
    }

    // 3. Send WhatsApp notification via CallMeBot
    const waMessage = buildLeadWhatsAppMessage(lead);
    sendWhatsAppNotification(waMessage).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
