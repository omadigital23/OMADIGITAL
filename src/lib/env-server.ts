// Server-only environment variables with validation

if (typeof window !== 'undefined') {
  throw new Error('env-server.ts should never be imported on the client');
}

function requireServerEnv(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(`Missing required server environment variable: ${name}`);
  }
  return value;
}

export const JWT_SECRET = requireServerEnv('JWT_SECRET', process.env.JWT_SECRET);
export const ADMIN_USERNAME = requireServerEnv('ADMIN_USERNAME', process.env.ADMIN_USERNAME);
export const ADMIN_PASSWORD_HASH = requireServerEnv('ADMIN_PASSWORD_HASH', process.env.ADMIN_PASSWORD_HASH);
export const ADMIN_SALT = requireServerEnv('ADMIN_SALT', process.env.ADMIN_SALT);

// Supabase service role (server-only)
export const SUPABASE_SERVICE_ROLE_KEY = requireServerEnv(
  'SUPABASE_SERVICE_ROLE_KEY',
  process.env['SUPABASE_SERVICE_ROLE_KEY']
);

// Optional server-side integrations
export const ALERT_WEBHOOK_URL = process.env['ALERT_WEBHOOK_URL'] || '';