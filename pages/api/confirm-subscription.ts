import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL } from '../../src/lib/env-public';
import { SUPABASE_SERVICE_ROLE_KEY } from '../../src/lib/env-server';

// Initialize Supabase client
const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Simple in-memory rate limiter
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limitInfo = rateLimiter.get(ip);

  if (!limitInfo || limitInfo.resetTime < now) {
    // Reset or initialize the counter
    rateLimiter.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (limitInfo.count >= MAX_REQUESTS) {
    return true; // Rate limited
  }

  // Increment the counter
  rateLimiter.set(ip, { count: limitInfo.count + 1, resetTime: limitInfo.resetTime });
  return false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get client IP
  const clientIP = (req.headers['x-forwarded-for'] as string) || 
                   (req.connection.remoteAddress as string) || 
                   'unknown';

  // Apply rate limiting
  if (isRateLimited(clientIP)) {
    return res.status(429).json({ error: 'Trop de requêtes. Veuillez réessayer plus tard.' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { token } = req.query;

  // Validate token
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Jeton de confirmation invalide' });
  }

  try {
    // Find subscriber by confirmation token
    const { data: subscriber, error } = await supabase
      .from('blog_subscribers')
      .select('id, email, status, confirmed_at')
      .eq('confirmation_token', token)
      .single();

    if (error || !subscriber) {
      return res.status(404).json({ error: 'Inscription non trouvée. Le lien de confirmation peut être expiré.' });
    }

    // Check if already confirmed
    if (subscriber.confirmed_at) {
      return res.status(200).json({ 
        message: 'Votre inscription est déjà confirmée. Merci de votre intérêt !' 
      });
    }

    // Update subscriber status to active and set confirmation timestamp
    const { error: updateError } = await supabase
      .from('blog_subscribers')
      .update({
        status: 'active',
        confirmed_at: new Date().toISOString()
      })
      .eq('id', subscriber.id);

    if (updateError) {
      console.error('Error confirming subscription:', updateError);
      return res.status(500).json({ error: 'Échec de la confirmation de l\'inscription' });
    }

    // Success response with HTML content for better UX
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation réussie</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; text-align: center; padding: 50px; background-color: #f9f9f9; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .success-icon { color: #10B981; font-size: 48px; margin-bottom: 20px; }
          h1 { color: #f97316; }
          .button { 
            display: inline-block; 
            background-color: #f97316; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            font-weight: bold; 
            margin-top: 20px;
          }
          .button:hover { background-color: #ea580c; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✓</div>
          <h1>Confirmation réussie !</h1>
          <p>Votre adresse email <strong>${subscriber.email}</strong> a été confirmée avec succès.</p>
          <p>Vous recevrez désormais nos contenus exclusifs sur l'IA et la transformation digitale pour les PME au Sénégal et au Maroc.</p>
          <p>Merci de votre confiance !</p>
          <a href="/" class="button">Retour à la page d'accueil</a>
        </div>
      </body>
      </html>
    `;
    
    // Send HTML response for better user experience
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(htmlResponse);

  } catch (error) {
    console.error('Newsletter confirmation error:', error);
    return res.status(500).json({ error: 'Erreur serveur interne' });
  }
}