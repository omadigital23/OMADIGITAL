// ============================================================
// OMA Digital — Email Notifications (Brevo SMTP)
// ============================================================

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const fromEmail = process.env.SMTP_FROM_EMAIL;
  const fromName = process.env.SMTP_FROM_NAME;

  if (!host || !user || !pass || !fromEmail) {
    console.warn('SMTP not configured, skipping email');
    return false;
  }

  try {
    // Use fetch to Brevo's API as a simpler alternative to nodemailer
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': pass, // Brevo uses the SMTP password as API key
      },
      body: JSON.stringify({
        sender: { name: fromName || 'OMA Digital', email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      console.error('Email send failed:', await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

export function buildLeadNotificationEmail(lead: {
  name: string;
  email: string;
  phone: string;
  business?: string;
  message?: string;
  service?: string;
}): { subject: string; html: string } {
  return {
    subject: `🎯 Nouveau lead OMA Digital: ${lead.name}`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a12; color: #f0f0f8; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4f7dff, #7c6aff, #a855f7); padding: 24px 32px;">
          <h1 style="margin: 0; font-size: 20px; color: white;">🚀 Nouveau Lead — OMA Digital</h1>
        </div>
        <div style="padding: 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #a0a0c0; width: 120px;">Nom</td><td style="padding: 8px 0; font-weight: 600;">${lead.name}</td></tr>
            <tr><td style="padding: 8px 0; color: #a0a0c0;">Email</td><td style="padding: 8px 0;"><a href="mailto:${lead.email}" style="color: #7c6aff;">${lead.email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #a0a0c0;">Téléphone</td><td style="padding: 8px 0;"><a href="tel:${lead.phone}" style="color: #7c6aff;">${lead.phone}</a></td></tr>
            ${lead.business ? `<tr><td style="padding: 8px 0; color: #a0a0c0;">Entreprise</td><td style="padding: 8px 0;">${lead.business}</td></tr>` : ''}
            ${lead.service ? `<tr><td style="padding: 8px 0; color: #a0a0c0;">Service</td><td style="padding: 8px 0;">${lead.service}</td></tr>` : ''}
            ${lead.message ? `<tr><td style="padding: 8px 0; color: #a0a0c0;">Message</td><td style="padding: 8px 0;">${lead.message}</td></tr>` : ''}
          </table>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
            <a href="https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}" style="display: inline-block; background: #25D366; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-right: 8px;">📱 WhatsApp</a>
            <a href="mailto:${lead.email}" style="display: inline-block; background: #7c6aff; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">📧 Email</a>
          </div>
        </div>
        <div style="padding: 16px 32px; background: rgba(255,255,255,0.03); text-align: center; color: #6b6b8a; font-size: 12px;">
          OMA Digital — ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' })}
        </div>
      </div>
    `,
  };
}
