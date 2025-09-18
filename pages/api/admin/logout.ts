import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { getRedis } from '../../../src/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse cookies
    const cookieHeader = req.headers.cookie || '';
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) acc[name] = value;
      return acc;
    }, {} as Record<string, string>);

    const token = cookies.admin_token;

    if (token) {
      // Add token to blacklist with TTL = remaining token lifetime (fallback 24h)
      try {
        const decoded: any = jwt.decode(token);
        const nowSec = Math.floor(Date.now() / 1000);
        const ttl = decoded?.exp && decoded.exp > nowSec ? decoded.exp - nowSec : 24 * 60 * 60;
        const redis = getRedis();
        await redis.incr(`bl:${token}`);
        await redis.expire(`bl:${token}`, ttl);
      } catch (e) {
        // Best effort; ignore decoding/redis errors
      }
    }

    // Clear the admin token cookie
    res.setHeader('Set-Cookie', `admin_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
    
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
