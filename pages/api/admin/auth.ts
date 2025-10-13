import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { logAuthSuccess, logAuthFailure, logRateLimit } from '../../../src/utils/security-monitoring';

import { ADMIN_USERNAME, ADMIN_PASSWORD_HASH, ADMIN_SALT, JWT_SECRET } from '../../../src/lib/env-server';

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const hashedPassword = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(hashedPassword, 'hex'));
}

import { isRateLimited } from '../../../src/lib/rate-limit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Configuration validation to avoid misleading credential errors when env is misconfigured
  if (!ADMIN_USERNAME || !ADMIN_SALT || !ADMIN_PASSWORD_HASH) {
    console.error('Admin auth misconfigured: missing env variables');
    return res.status(500).json({ error: 'Admin authentication not configured on server' });
  }
  const hexRegex = /^[0-9a-f]+$/i;
  if (!hexRegex.test(ADMIN_SALT)) {
    console.error('Admin auth misconfigured: invalid ADMIN_SALT format');
    return res.status(500).json({ error: 'Admin authentication misconfigured' });
  }
  if (!hexRegex.test(ADMIN_PASSWORD_HASH) || ADMIN_PASSWORD_HASH.length !== 128) {
    console.error('Admin auth misconfigured: invalid ADMIN_PASSWORD_HASH format');
    return res.status(500).json({ error: 'Admin authentication misconfigured' });
  }

  const clientIP = (req.headers['x-forwarded-for'] as string) || 
                   (req.headers['x-real-ip'] as string) || 
                   req.socket.remoteAddress || 
                   'unknown';

  // Rate limiting check (5 attempts per 15 min)
  const rl = await isRateLimited(clientIP, '/api/admin/auth', { windowSec: 15 * 60, maxRequests: 5, prefix: 'login' });
  if (rl['limited']) {
    await logRateLimit(clientIP, '/api/admin/auth', req.headers['user-agent'] || 'unknown');
    return res.status(429).json({ 
      error: 'Too many login attempts. Please try again later.',
      retryAfter: rl.resetInSec
    });
  }

  const { username, password } = req.body;

  // Validate input
  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Invalid input format' });
  }

  // Trim inputs to avoid whitespace issues
  const usernameInput = username.trim();
  const passwordInput = password;

  // Input length validation
  if (usernameInput.length > 50 || passwordInput.length > 100) {
    return res.status(400).json({ error: 'Input too long' });
  }

  try {
    // Timing-safe comparison for username
    const usernameMatch = crypto.timingSafeEqual(
      Buffer.from(usernameInput.padEnd(50, '\0')),
      Buffer.from(ADMIN_USERNAME.padEnd(50, '\0'))
    );

    // Verify password
    const passwordMatch = verifyPassword(passwordInput, ADMIN_PASSWORD_HASH, ADMIN_SALT);

    if (usernameMatch && passwordMatch) {
      // Create secure JWT token
      const token = jwt.sign(
        { 
          username: ADMIN_USERNAME,
          role: 'admin',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        },
        JWT_SECRET,
        { algorithm: 'HS256' }
      );
      
      // Set secure HTTP-only cookie with JWT only
      // Don't use Secure flag in development (localhost)
      const isProduction = process.env.NODE_ENV === 'production';
      const secureFlag = isProduction ? 'Secure; ' : '';
      
      const cookieOptions = [
        `admin_token=${token}; Path=/; HttpOnly; ${secureFlag}SameSite=Strict; Max-Age=86400`
      ];
      res.setHeader('Set-Cookie', cookieOptions);
      
      // Log successful authentication
      await logAuthSuccess(ADMIN_USERNAME, clientIP, req.headers['user-agent'] || 'unknown');
      
      return res.status(200).json({ 
        success: true, 
        message: 'Authentication successful',
        expiresIn: 86400
      });
    } else {
      // Log failed authentication
      await logAuthFailure(usernameInput, clientIP, req.headers['user-agent'] || 'unknown', 'Invalid credentials');
      
      // Temporary debug info (remove after working)
      console.log('Login attempt failed:', {
        providedUsername: usernameInput,
        expectedUsernameLength: ADMIN_USERNAME.length,
        providedUsernameLength: usernameInput.length,
        saltLength: ADMIN_SALT.length,
        hashLength: ADMIN_PASSWORD_HASH.length
      });
      
      // Add delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}