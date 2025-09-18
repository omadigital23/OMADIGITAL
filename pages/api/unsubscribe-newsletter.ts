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
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.query;

  // Validate token
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Invalid unsubscribe token' });
  }

  try {
    // Find subscriber by token
    const { data: subscriber, error } = await supabase
      .from('blog_subscribers')
      .select('id, email, status')
      .eq('unsubscribe_token', token)
      .single();

    if (error || !subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    // Check if already unsubscribed
    if (subscriber.status === 'unsubscribed') {
      return res.status(200).json({ 
        message: 'You are already unsubscribed from our newsletter.' 
      });
    }

    // Update subscriber status
    const { error: updateError } = await supabase
      .from('blog_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })
      .eq('id', subscriber.id);

    if (updateError) {
      console.error('Error unsubscribing user:', updateError);
      return res.status(500).json({ error: 'Failed to unsubscribe' });
    }

    // Success response
    return res.status(200).json({ 
      message: `You have been successfully unsubscribed from our newsletter (${subscriber.email}).` 
    });

  } catch (error) {
    console.error('Newsletter unsubscription error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}