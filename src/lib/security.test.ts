import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getClientIp,
  isAllowedOrigin,
  isBotTrapFilled,
  isValidEmail,
  isValidPhone,
  normalizeText,
} from '@/lib/security';

function headers(values: Record<string, string | undefined>) {
  return {
    get(name: string) {
      return values[name.toLowerCase()] ?? null;
    },
  };
}

describe('security helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('normalizes untrusted text inputs without coercing non-strings', () => {
    expect(normalizeText('  OMA Digital  ')).toBe('OMA Digital');
    expect(normalizeText(123)).toBe('');
    expect(isBotTrapFilled('https://spam.example')).toBe(true);
  });

  it('validates common email and phone formats', () => {
    expect(isValidEmail('client@example.com')).toBe(true);
    expect(isValidEmail('client@example')).toBe(false);
    expect(isValidPhone('+221 77 123 45 67')).toBe(true);
    expect(isValidPhone('abc-123')).toBe(false);
  });

  it('requires a same-site or configured origin', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://www.omadigital.net');

    expect(
      isAllowedOrigin(headers({
        origin: 'https://www.omadigital.net',
        host: 'www.omadigital.net',
      }))
    ).toBe(true);

    expect(
      isAllowedOrigin(headers({
        origin: 'https://attacker.example',
        host: 'www.omadigital.net',
      }))
    ).toBe(false);

    expect(isAllowedOrigin(headers({ host: 'www.omadigital.net' }))).toBe(false);
  });

  it('uses the first forwarded IP hop', () => {
    expect(
      getClientIp(headers({
        'x-forwarded-for': '203.0.113.10, 10.0.0.1',
      }))
    ).toBe('203.0.113.10');
  });
});
