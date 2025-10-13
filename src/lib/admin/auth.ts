/**
 * Admin Authentication Module
 * Handles admin user verification and authentication
 */

import { createClient } from '@supabase/supabase-js';
import { NextApiRequest } from 'next';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

/**
 * Verify admin authentication from request
 */
export async function verifyAdminAuth(req: NextApiRequest): Promise<AdminUser> {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('No authorization token provided');
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      throw new Error('Invalid authentication token');
    }

    // Check if user is admin in admin_users table
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', user.email)
      .eq('is_active', true)
      .single();

    if (adminError || !adminUser) {
      throw new Error('User is not authorized as admin');
    }

    return {
      id: user.id,
      email: user.email!,
      role: adminUser.role || 'admin',
      permissions: adminUser.permissions || ['read', 'write']
    };

  } catch (error) {
    throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Simple admin check for basic endpoints
 */
export async function isAdminUser(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    return !error && !!data;
  } catch {
    return false;
  }
}

/**
 * Higher-order function for admin authentication
 */
export function withAdminAuth(handler: any) {
  return async (req: any, res: any) => {
    try {
      const adminUser = await verifyAdminAuth(req);
      req.adminUser = adminUser;
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: error instanceof Error ? error.message : 'Access denied' 
      });
    }
  };
}

export default { verifyAdminAuth, isAdminUser, supabaseAdmin, withAdminAuth };