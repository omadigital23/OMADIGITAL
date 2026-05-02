type HeaderBag = {
  get(name: string): string | null;
};

const CONTACT_SERVICES = new Set(['website', 'mobile', 'ai', 'support']);

export function getClientIp(headers: HeaderBag): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstHop = forwardedFor
      .split(',')
      .map((part) => part.trim())
      .find(Boolean);

    if (firstHop) {
      return firstHop;
    }
  }

  return (
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    headers.get('x-vercel-forwarded-for') ||
    'unknown'
  );
}

export function isAllowedOrigin(headers: HeaderBag): boolean {
  const origin = headers.get('origin');
  if (!origin) {
    return false;
  }

  const allowedOrigins = new Set<string>();
  const host = headers.get('host');

  if (host) {
    allowedOrigins.add(`https://${host}`);
    allowedOrigins.add(`http://${host}`);
  }

  for (const candidate of [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_DOMAIN,
  ]) {
    if (!candidate) {
      continue;
    }

    try {
      allowedOrigins.add(new URL(candidate).origin);
    } catch {
      // Ignore malformed environment values and continue with known-safe origins.
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.add('http://localhost:3000');
    allowedOrigins.add('http://127.0.0.1:3000');
  }

  try {
    return allowedOrigins.has(new URL(origin).origin);
  } catch {
    return false;
  }
}

export function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function isBotTrapFilled(value: unknown): boolean {
  return normalizeText(value).length > 0;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15 && /^[0-9+()\s.-]+$/.test(phone);
}

export function isValidContactService(service: string): boolean {
  return service === '' || CONTACT_SERVICES.has(service);
}
