import { NextApiRequest, NextApiResponse } from 'next';

const rateLimitMap = new Map();

export function rateLimit(limit: number = 10, windowMs: number = 60000) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, []);
    }
    
    const requests = rateLimitMap.get(ip).filter((time: number) => time > windowStart);
    
    if (requests.length >= limit) {
      // Ajouter headers de rate limiting
      res.setHeader('X-RateLimit-Limit', limit.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000).toString());
      
      return res.status(429).json({ 
        error: 'Too many requests',
        message: `Rate limit exceeded. Limit: ${limit} requests per ${windowMs/1000} seconds.`,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    requests.push(now);
    rateLimitMap.set(ip, requests);
    
    // Ajouter headers de rate limiting
    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', (limit - requests.length).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000).toString());
    
    next();
  };
}

// Export alias pour compatibilité
export const withRateLimit = rateLimit;