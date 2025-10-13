import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import DOMPurify from 'isomorphic-dompurify';

// Validate environment variables
const SUPABASE_URL = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_SERVICE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables:', {
    hasUrl: !!SUPABASE_URL,
    hasServiceKey: !!SUPABASE_SERVICE_KEY
  });
}

// Initialize Supabase client with fallback
let supabase: ReturnType<typeof createClient> | null = null;

try {
  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    console.log('✅ Supabase client initialized successfully');
  }
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error);
}

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

// Function to send confirmation email
async function sendConfirmationEmail(email: string, token: string) {
  try {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 Confirmation email would be sent to ${email} with token ${token}`);
      console.log(`📧 Confirmation link: http://localhost:3000/api/confirm-subscription?token=${token}`);
      return { success: true };
    }
    
    // Production email sending implementation with SendGrid
    if (!process.env['SENDGRID_API_KEY']) {
      console.error('SENDGRID_API_KEY is not set');
      return { success: false, error: 'Email service not configured' };
    }
    
    const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] || 'https://www.oma-digital.com';
    const confirmationLink = `${siteUrl}/api/confirm-subscription?token=${token}`;
    
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env['SENDGRID_API_KEY']}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email }],
          subject: 'Confirmez votre inscription à la newsletter OMA Digital'
        }],
        from: { email: 'noreply@oma-digital.com', name: 'OMA Digital' },
        content: [{
          type: 'text/html',
          value: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Confirmez votre inscription</title>
            </head>
            <body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px; padding: 20px 0; border-bottom: 1px solid #eee;">
                  <h1 style="color: #f97316; margin: 0; font-size: 28px;">OMA Digital</h1>
                  <p style="color: #666; margin: 10px 0 0; font-size: 16px;">Transformation digitale pour les PME</p>
                </div>
                
                <h2 style="color: #333; margin-top: 0;">Confirmez votre inscription à notre newsletter</h2>
                
                <p>Bonjour,</p>
                
                <p>Merci de vous être inscrit à notre newsletter !</p>
                
                <p>Pour finaliser votre inscription et commencer à recevoir nos contenus exclusifs sur l'IA et la transformation digitale des PME au Sénégal et au Maroc, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${confirmationLink}" 
                     style="background-color: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
                    Confirmer mon inscription
                  </a>
                </div>
                
                <p style="text-align: center; color: #666; font-size: 14px;">
                  Ou copiez et collez ce lien dans votre navigateur :<br>
                  <span style="word-break: break-all; color: #f97316;">${confirmationLink}</span>
                </p>
                
                <p>Si vous n'avez pas demandé cette inscription, vous pouvez ignorer cet email. Votre adresse ne sera pas ajoutée à notre liste sans confirmation.</p>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="font-size: 12px; color: #999;">
                    © 2025 OMA Digital. Tous droits réservés.<br>
                    Sénégal & Maroc<br>
                    <a href="${siteUrl}/politique-confidentialite" style="color: #999; text-decoration: none;">Politique de confidentialité</a> | 
                    <a href="${siteUrl}/contact" style="color: #999; text-decoration: none;">Contact</a>
                  </p>
                </div>
              </div>
            </body>
            </html>
          `
        }]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid API error:', response.status, errorText);
      return { success: false, error: `Email API error: ${response.status}` };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: 'Failed to send confirmation email' };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if Supabase is initialized
  if (!supabase) {
    console.error('❌ Supabase client not initialized');
    return res.status(500).json({ 
      error: 'Service de newsletter temporairement indisponible',
      details: 'Supabase configuration error'
    });
  }

  // Get client IP
  const clientIP = (req.headers['x-forwarded-for'] as string) || 
                   (req.connection.remoteAddress as string) || 
                   'unknown';

  console.log('=== Newsletter Subscription Request ===');
  console.log('Client IP:', clientIP);
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  // Apply rate limiting
  if (isRateLimited(clientIP)) {
    console.log('❌ Rate limited request from IP:', clientIP);
    return res.status(429).json({ error: 'Trop de requêtes. Veuillez réessayer plus tard.' });
  }

  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { email, source = 'footer' } = req.body;

  console.log('📧 Email from request:', email);
  console.log('📱 Source from request:', source);

  // Validate email
  if (!email || typeof email !== 'string') {
    console.log('❌ Invalid email provided:', email);
    return res.status(400).json({ error: 'Email requis' });
  }

  // Sanitize and validate email
  const sanitizedEmail = DOMPurify.sanitize(email.trim().toLowerCase());
  
  console.log('🧼 Sanitized email:', sanitizedEmail);
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitizedEmail)) {
    console.log('❌ Invalid email format:', sanitizedEmail);
    return res.status(400).json({ error: 'Format email invalide' });
  }

  // Additional security: Check email length
  if (sanitizedEmail.length > 254) {
    console.log('❌ Email too long:', sanitizedEmail);
    return res.status(400).json({ error: 'Email trop long' });
  }

  try {
    console.log('✅ Email validation passed, attempting to subscribe:', sanitizedEmail);
    
    // Check if subscriber already exists
    const { data: existingSubscriber, error: fetchError } = await supabase
      .from('blog_subscribers')
      .select('id, status, confirmation_token, confirmed_at')
      .eq('email', sanitizedEmail)
      .maybeSingle();

    console.log('🔍 Existing subscriber check result:', { existingSubscriber, fetchError });

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error checking existing subscriber:', fetchError);
      return res.status(500).json({ error: 'Erreur serveur interne' });
    }

    // If subscriber exists and is active and confirmed, return success
    if (existingSubscriber && existingSubscriber.status === 'active' && existingSubscriber.confirmed_at) {
      console.log('✅ Email already subscribed and confirmed:', sanitizedEmail);
      return res.status(200).json({ 
        message: 'Email déjà inscrit à notre newsletter', 
        success: true 
      });
    }

    // If subscriber exists but is unsubscribed, change status to pending
    if (existingSubscriber && existingSubscriber.status === 'unsubscribed') {
      console.log('🔄 Re-subscribing unsubscribed user:', sanitizedEmail);
      // Update status to pending for re-subscription
      const { error: updateError } = await supabase
        .from('blog_subscribers')
        .update({ status: 'pending', unsubscribed_at: null })
        .eq('id', existingSubscriber.id);
        
      if (updateError) {
        console.error('❌ Error updating unsubscribed subscriber:', updateError);
        return res.status(500).json({ error: 'Échec de la mise à jour de l\'inscription' });
      }
    }

    // Generate tokens
    const confirmationToken = Buffer.from(`${sanitizedEmail}-${Date.now()}-${Math.random()}`).toString('base64');
    const unsubscribeToken = Buffer.from(`${sanitizedEmail}-${Date.now()}-${Math.random()}`).toString('base64');

    console.log('🔑 Generated tokens for:', sanitizedEmail);

    // Prepare subscriber data
    const subscriberData = {
      email: sanitizedEmail,
      status: 'pending', // All new subscriptions start as pending for double opt-in
      source,
      confirmation_token: confirmationToken,
      unsubscribe_token: unsubscribeToken,
      subscribed_at: new Date().toISOString(),
      confirmed_at: null
    };

    console.log('📝 Subscriber data to insert/update:', JSON.stringify(subscriberData, null, 2));

    let result;
    if (existingSubscriber) {
      console.log('🔄 Updating existing subscriber:', sanitizedEmail);
      // Update existing subscriber
      result = await supabase
        .from('blog_subscribers')
        .update(subscriberData)
        .eq('id', existingSubscriber.id);
    } else {
      console.log('🆕 Inserting new subscriber:', sanitizedEmail);
      // Insert new subscriber
      result = await supabase
        .from('blog_subscribers')
        .insert(subscriberData);
    }

    console.log('💾 Database operation result:', { result });

    if (result.error) {
      console.error('❌ Error subscribing user:', result.error);
      return res.status(500).json({ error: 'Échec de l\'inscription' });
    }

    console.log('✅ Successfully processed subscription for:', sanitizedEmail);
    
    // Send confirmation email for new subscribers or those without confirmation
    if (!existingSubscriber || !existingSubscriber.confirmed_at) {
      console.log('📧 Sending confirmation email to:', sanitizedEmail);
      const emailResult = await sendConfirmationEmail(sanitizedEmail, confirmationToken);
      
      if (!emailResult.success) {
        console.error('❌ Failed to send confirmation email:', emailResult.error);
        // We still return success to the client but log the email error
        return res.status(200).json({ 
          message: 'Inscription réussie ! Veuillez vérifier votre email pour confirmer votre inscription.', 
          success: true,
          confirmationSent: false
        });
      }
    }

    // Success response
    const message = existingSubscriber && existingSubscriber.confirmed_at 
      ? 'Email déjà inscrit et confirmé à notre newsletter' 
      : 'Inscription réussie ! Un email de confirmation a été envoyé. Veuillez cliquer sur le lien de confirmation pour finaliser votre inscription.';
      
    console.log('🎉 Subscription completed for:', sanitizedEmail);
    return res.status(200).json({ 
      message, 
      success: true,
      confirmationSent: true
    });

  } catch (error) {
    console.error('💥 Newsletter subscription error:', error);
    return res.status(500).json({ error: 'Erreur serveur interne' });
  }
}
