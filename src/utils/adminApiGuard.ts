import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, ADMIN_USERNAME } from '../lib/env-server';

export function requireAdminApi(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const cookieHeader = req.headers.cookie || '';
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) acc[name] = value;
        return acc;
      }, {} as Record<string, string>);

      const token = cookies['admin_token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (!decoded?.username || decoded.username !== ADMIN_USERNAME || decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Check token blacklist
      try {
        const { getRedis } = await import('../lib/redis');
        const redis = getRedis();
        const blacklisted = await redis.get(`bl:${token}`);
        if (blacklisted) {
          return res.status(401).json({ error: 'Token revoked' });
        }
      } catch {}

      return handler(req, res);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}
