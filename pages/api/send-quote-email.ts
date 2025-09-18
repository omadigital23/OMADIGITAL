import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, service, message } = req.body;

  // Simple email via webhook (Zapier/Make.com)
  const webhookUrl = process.env.EMAIL_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('Email notification:', { name, email, service });
    return res.status(200).json({ success: true, method: 'logged' });
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'contact@omadigital.sn',
        subject: `Nouveau devis: ${service}`,
        text: `Nom: ${name}\nEmail: ${email}\nService: ${service}\nMessage: ${message}`
      })
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}