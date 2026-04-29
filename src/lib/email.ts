import type { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
}

let transporterPromise: Promise<Transporter> | null = null;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMultilineHtml(value: string): string {
  return escapeHtml(value).replace(/\n/g, '<br />');
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|table|h1|h2|h3)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const portValue = process.env.SMTP_PORT?.trim() || '587';
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim();
  const fromEmail = process.env.SMTP_FROM_EMAIL?.trim();
  const fromName = process.env.SMTP_FROM_NAME?.trim() || 'OMA DIGITAL';
  const port = Number(portValue);

  if (!host || !user || !pass || !fromEmail) {
    console.warn('SMTP not configured, skipping email');
    return null;
  }

  if (!Number.isInteger(port) || port <= 0) {
    console.error('Invalid SMTP_PORT value:', portValue);
    return null;
  }

  return {
    host,
    port,
    secure: port === 465,
    user,
    pass,
    fromEmail,
    fromName,
  };
}

async function createTransporter(config: SmtpConfig): Promise<Transporter> {
  const nodemailerModule = await import('nodemailer');
  const nodemailer = nodemailerModule.default ?? nodemailerModule;

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: config.port === 587,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}

async function getTransporter(): Promise<Transporter | null> {
  const config = getSmtpConfig();
  if (!config) {
    return null;
  }

  if (!transporterPromise) {
    transporterPromise = createTransporter(config).catch((error) => {
      transporterPromise = null;
      throw error;
    });
  }

  return transporterPromise;
}

export async function sendEmail({ to, subject, html, replyTo }: EmailOptions): Promise<boolean> {
  const config = getSmtpConfig();
  const transporter = await getTransporter();

  if (!config || !transporter) {
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: {
        name: config.fromName,
        address: config.fromEmail,
      },
      to,
      replyTo,
      subject,
      html,
      text: htmlToText(html),
    });

    return info.accepted.length > 0;
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
  const safeName = escapeHtml(lead.name);
  const safeEmail = escapeHtml(lead.email);
  const safePhone = escapeHtml(lead.phone);
  const safeBusiness = lead.business ? escapeHtml(lead.business) : '';
  const safeService = lead.service ? escapeHtml(lead.service) : '';
  const safeMessage = lead.message ? formatMultilineHtml(lead.message) : '';
  const phoneHref = lead.phone.replace(/[^\d+]/g, '');
  const whatsappHref = lead.phone.replace(/\D/g, '');

  return {
    subject: `Nouveau lead OMA Digital: ${lead.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #0b1020; color: #f3f4f6; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 24px 32px;">
          <h1 style="margin: 0; font-size: 22px; color: white;">Nouveau lead OMA Digital</h1>
        </div>
        <div style="padding: 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #cbd5e1; width: 140px;">Nom</td><td style="padding: 8px 0; font-weight: 600;">${safeName}</td></tr>
            <tr><td style="padding: 8px 0; color: #cbd5e1;">Email</td><td style="padding: 8px 0;"><a href="mailto:${safeEmail}" style="color: #a78bfa;">${safeEmail}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #cbd5e1;">Telephone</td><td style="padding: 8px 0;"><a href="tel:${phoneHref}" style="color: #a78bfa;">${safePhone}</a></td></tr>
            ${lead.business ? `<tr><td style="padding: 8px 0; color: #cbd5e1;">Entreprise</td><td style="padding: 8px 0;">${safeBusiness}</td></tr>` : ''}
            ${lead.service ? `<tr><td style="padding: 8px 0; color: #cbd5e1;">Service</td><td style="padding: 8px 0;">${safeService}</td></tr>` : ''}
            ${lead.message ? `<tr><td style="padding: 8px 0; color: #cbd5e1;">Message</td><td style="padding: 8px 0;">${safeMessage}</td></tr>` : ''}
          </table>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.12);">
            <a href="https://wa.me/${whatsappHref}" style="display: inline-block; background: #22c55e; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-right: 8px;">WhatsApp</a>
            <a href="mailto:${safeEmail}" style="display: inline-block; background: #7c3aed; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Repondre</a>
          </div>
        </div>
        <div style="padding: 16px 32px; background: rgba(255,255,255,0.04); text-align: center; color: #94a3b8; font-size: 12px;">
          OMA Digital - ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' })}
        </div>
      </div>
    `,
  };
}

export function buildNewsletterNotificationEmail(email: string): { subject: string; html: string } {
  const safeEmail = escapeHtml(email);

  return {
    subject: `Nouvel abonne newsletter: ${email}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #0b1020; color: #f3f4f6; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0891b2, #7c3aed); padding: 24px 32px;">
          <h1 style="margin: 0; font-size: 22px; color: white;">Nouvel abonne newsletter</h1>
        </div>
        <div style="padding: 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #cbd5e1; width: 140px;">Email</td><td style="padding: 8px 0; font-weight: 600;"><a href="mailto:${safeEmail}" style="color: #a78bfa;">${safeEmail}</a></td></tr>
          </table>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.12);">
            <a href="mailto:${safeEmail}" style="display: inline-block; background: #7c3aed; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Repondre</a>
          </div>
        </div>
        <div style="padding: 16px 32px; background: rgba(255,255,255,0.04); text-align: center; color: #94a3b8; font-size: 12px;">
          OMA Digital - ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' })}
        </div>
      </div>
    `,
  };
}
