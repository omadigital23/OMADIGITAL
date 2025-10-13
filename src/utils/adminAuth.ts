import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET, ADMIN_USERNAME } from '../lib/env-server';
import { logError, AuthenticationError } from './error-handling';

// ============================================================================
// Types
// ============================================================================

interface AdminJwtPayload extends JwtPayload {
  username: string;
  role: string;
  iat: number;
  exp: number;
}

interface AuthResult {
  isAuthenticated: boolean;
  user?: {
    username: string;
    role: string;
  };
  error?: string;
}

type GetServerSidePropsFunction<P = Record<string, unknown>> = (
  context: GetServerSidePropsContext
) => Promise<GetServerSidePropsResult<P>>;

// ============================================================================
// Cookie Parsing Utility
// ============================================================================

function parseCookies(cookieHeader: string): Record<string, string> {
  return cookieHeader
    .split(';')
    .reduce((acc, cookie) => {
      const [name, ...rest] = cookie.trim().split('=');
      if (name && rest.length > 0) {
        acc[name] = rest.join('='); // Handle cookies with = in value
      }
      return acc;
    }, {} as Record<string, string>);
}

// ============================================================================
// Authentication Functions
// ============================================================================

export function isAuthenticated(context: GetServerSidePropsContext): AuthResult {
  const { req } = context;
  
  try {
    // Get the admin token from cookies
    const cookieHeader = req.headers.cookie || '';
    const cookies = parseCookies(cookieHeader);
    
    const adminToken = cookies['admin_token'];
    
    if (!adminToken) {
      return { isAuthenticated: false, error: 'No admin token found' };
    }
    
    // Verify JWT token with proper typing
    const decoded = jwt.verify(adminToken, JWT_SECRET) as AdminJwtPayload;
    
    // Validate token structure
    if (!decoded.username || !decoded.role) {
      return { isAuthenticated: false, error: 'Invalid token structure' };
    }
    
    // Check role
    if (decoded.role !== 'admin') {
      return { isAuthenticated: false, error: 'Invalid role' };
    }
    
    // Check username
    if (decoded.username !== ADMIN_USERNAME) {
      return { isAuthenticated: false, error: 'Invalid username' };
    }
    
    // Check expiration explicitly (jwt.verify should handle this, but double-check)
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return { isAuthenticated: false, error: 'Token expired' };
    }
    
    return {
      isAuthenticated: true,
      user: {
        username: decoded.username,
        role: decoded.role,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log authentication errors for monitoring
    logError(new AuthenticationError(`Token verification failed: ${errorMessage}`), {
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] as string || req.socket?.remoteAddress,
    });
    
    return { isAuthenticated: false, error: errorMessage };
  }
}

// ============================================================================
// HOC for Admin Page Protection
// ============================================================================

export function withAdminAuth<P = Record<string, unknown>>(
  getServerSideProps?: GetServerSidePropsFunction<P>
) {
  return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const authResult = isAuthenticated(context);
    
    if (!authResult.isAuthenticated) {
      // Log failed authentication attempt
      await logError(
        new AuthenticationError(`Admin access denied: ${authResult.error}`),
        {
          url: context.req.url,
          userAgent: context.req.headers['user-agent'],
          ip: context.req.headers['x-forwarded-for'] as string || context.req.socket?.remoteAddress,
        }
      );
      
      return {
        redirect: {
          destination: '/admin/login',
          permanent: false,
        },
      };
    }
    
    // User is authenticated, proceed with the original getServerSideProps
    if (getServerSideProps) {
      try {
        return await getServerSideProps(context);
      } catch (error) {
        await logError(
          error instanceof Error ? error : new Error(String(error)),
          {
            url: context.req.url,
            userId: authResult.user?.username,
            userAgent: context.req.headers['user-agent'],
          }
        );
        
        // Return error page or redirect
        return {
          redirect: {
            destination: '/admin/login?error=server_error',
            permanent: false,
          },
        };
      }
    }
    
    // No additional server-side props needed
    return {
      props: {} as P,
    };
  };
}

// ============================================================================
// Admin User Context for Client-Side
// ============================================================================

export interface AdminUser {
  username: string;
  role: string;
  isAuthenticated: boolean;
}

export function getAdminUserFromCookie(): AdminUser | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const cookies = parseCookies(document.cookie);
    const adminToken = cookies['admin_token'];
    
    if (!adminToken) {
      return null;
    }
    
    // Note: We can't verify the JWT on client-side without exposing the secret
    // So we'll just decode it (without verification) for UI purposes
    const payload = JSON.parse(atob(adminToken.split('.')[1])) as AdminJwtPayload;
    
    // Basic validation
    if (!payload.username || !payload.role || payload.role !== 'admin') {
      return null;
    }
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }
    
    return {
      username: payload.username,
      role: payload.role,
      isAuthenticated: true,
    };
  } catch {
    return null;
  }
}

// ============================================================================
// Logout Utility
// ============================================================================

export function logoutAdmin(): void {
  if (typeof window !== 'undefined') {
    // Clear the admin token cookie - can't set HttpOnly from client side
    document.cookie = 'admin_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict';
    
    // Also call logout API to clear server-side cookie properly
    fetch('/api/admin/logout', { method: 'POST', credentials: 'include' }).finally(() => {
      // Redirect to login
      window.location.href = '/admin/login';
    });
  }
}