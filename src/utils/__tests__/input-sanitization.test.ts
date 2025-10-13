// Test file for input sanitization utilities

import {
  sanitizeString,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeNumber,
  sanitizeBoolean,
  sanitizeUUID,
  sanitizeIpAddress,
  sanitizeUserAgent,
  sanitizeDeviceType,
  sanitizeBrowser,
  sanitizeOperatingSystem,
  sanitizeCountry,
  sanitizeLocationName,
  sanitizeEventType,
  sanitizeElementId,
  sanitizeElementClass,
  sanitizeElementText,
  sanitizeCoordinate,
  sanitizeScrollDepth,
  sanitizeEngagementScore,
  sanitizeReadCompletion
} from '../input-sanitization';

describe('Input Sanitization Utilities', () => {
  describe('sanitizeString', () => {
    test('should trim and limit strings', () => {
      expect(sanitizeString('  test  ')).toBe('test');
      expect(sanitizeString('a'.repeat(1001), 1000)).toBe('a'.repeat(1000));
      expect(sanitizeString(123 as any)).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    test('should validate email addresses', () => {
      expect(sanitizeEmail('test@example.com')).toBe('test@example.com');
      expect(sanitizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
      expect(sanitizeEmail('invalid-email')).toBe('');
      expect(sanitizeEmail('')).toBe('');
      expect(sanitizeEmail(123 as any)).toBe('');
    });
  });

  describe('sanitizeUrl', () => {
    test('should validate URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
      expect(sanitizeUrl('http://example.com/path?query=1')).toBe('http://example.com/path?query=1');
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
      expect(sanitizeUrl('')).toBe('');
      expect(sanitizeUrl(123 as any)).toBe('');
    });
  });

  describe('sanitizeNumber', () => {
    test('should validate and clamp numbers', () => {
      expect(sanitizeNumber(5)).toBe(5);
      expect(sanitizeNumber('10')).toBe(10);
      expect(sanitizeNumber(-5, 0, 100)).toBe(0);
      expect(sanitizeNumber(150, 0, 100)).toBe(100);
      expect(sanitizeNumber('invalid')).toBe(0);
    });
  });

  describe('sanitizeBoolean', () => {
    test('should convert values to boolean', () => {
      expect(sanitizeBoolean(true)).toBe(true);
      expect(sanitizeBoolean(false)).toBe(false);
      expect(sanitizeBoolean('true')).toBe(true);
      expect(sanitizeBoolean('false')).toBe(false);
      expect(sanitizeBoolean(1)).toBe(true);
      expect(sanitizeBoolean(0)).toBe(false);
      expect(sanitizeBoolean('')).toBe(false);
    });
  });

  describe('sanitizeUUID', () => {
    test('should validate UUIDs', () => {
      expect(sanitizeUUID('550e8400-e29b-41d4-a716-446655440000')).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(sanitizeUUID('550E8400-E29B-41D4-A716-446655440000')).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(sanitizeUUID('invalid-uuid')).toBe('');
      expect(sanitizeUUID('')).toBe('');
      expect(sanitizeUUID(123 as any)).toBe('');
    });
  });

  describe('sanitizeIpAddress', () => {
    test('should validate IP addresses', () => {
      expect(sanitizeIpAddress('192.168.1.1')).toBe('192.168.1.1');
      expect(sanitizeIpAddress('255.255.255.255')).toBe('255.255.255.255');
      expect(sanitizeIpAddress('256.1.1.1')).toBe('');
      expect(sanitizeIpAddress('invalid-ip')).toBe('');
      expect(sanitizeIpAddress('')).toBe('');
      expect(sanitizeIpAddress(123 as any)).toBe('');
    });
  });

  describe('sanitizeUserAgent', () => {
    test('should clean user agent strings', () => {
      expect(sanitizeUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')).toBe('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      expect(sanitizeUserAgent('a'.repeat(501))).toBe('a'.repeat(500));
      expect(sanitizeUserAgent('')).toBe('');
      expect(sanitizeUserAgent(123 as any)).toBe('');
    });
  });

  describe('sanitizeDeviceType', () => {
    test('should validate device types', () => {
      expect(sanitizeDeviceType('mobile')).toBe('mobile');
      expect(sanitizeDeviceType('MOBILE')).toBe('mobile');
      expect(sanitizeDeviceType('tablet')).toBe('tablet');
      expect(sanitizeDeviceType('desktop')).toBe('desktop');
      expect(sanitizeDeviceType('invalid')).toBe('unknown');
      expect(sanitizeDeviceType('')).toBe('unknown');
      expect(sanitizeDeviceType(123 as any)).toBe('unknown');
    });
  });

  describe('sanitizeBrowser', () => {
    test('should validate browser names', () => {
      expect(sanitizeBrowser('chrome')).toBe('chrome');
      expect(sanitizeBrowser('CHROME')).toBe('chrome');
      expect(sanitizeBrowser('firefox')).toBe('firefox');
      expect(sanitizeBrowser('safari')).toBe('safari');
      expect(sanitizeBrowser('edge')).toBe('edge');
      expect(sanitizeBrowser('opera')).toBe('opera');
      expect(sanitizeBrowser('invalid')).toBe('unknown');
      expect(sanitizeBrowser('')).toBe('unknown');
      expect(sanitizeBrowser(123 as any)).toBe('unknown');
    });
  });

  describe('sanitizeOperatingSystem', () => {
    test('should validate OS names', () => {
      expect(sanitizeOperatingSystem('windows')).toBe('windows');
      expect(sanitizeOperatingSystem('WINDOWS')).toBe('windows');
      expect(sanitizeOperatingSystem('macos')).toBe('macos');
      expect(sanitizeOperatingSystem('linux')).toBe('linux');
      expect(sanitizeOperatingSystem('android')).toBe('android');
      expect(sanitizeOperatingSystem('ios')).toBe('ios');
      expect(sanitizeOperatingSystem('invalid')).toBe('unknown');
      expect(sanitizeOperatingSystem('')).toBe('unknown');
      expect(sanitizeOperatingSystem(123 as any)).toBe('unknown');
    });
  });

  describe('sanitizeCountry', () => {
    test('should validate country codes', () => {
      expect(sanitizeCountry('US')).toBe('US');
      expect(sanitizeCountry('us')).toBe('US');
      expect(sanitizeCountry('USA')).toBe('');
      expect(sanitizeCountry('invalid')).toBe('');
      expect(sanitizeCountry('')).toBe('');
      expect(sanitizeCountry(123 as any)).toBe('');
    });
  });

  describe('sanitizeLocationName', () => {
    test('should clean location names', () => {
      expect(sanitizeLocationName('New York')).toBe('New York');
      expect(sanitizeLocationName('a'.repeat(101))).toBe('a'.repeat(100));
      expect(sanitizeLocationName('')).toBe('');
      expect(sanitizeLocationName(123 as any)).toBe('');
    });
  });

  describe('sanitizeEventType', () => {
    test('should validate event types', () => {
      expect(sanitizeEventType('click')).toBe('click');
      expect(sanitizeEventType('CLICK')).toBe('click');
      expect(sanitizeEventType('scroll')).toBe('scroll');
      expect(sanitizeEventType('form_submit')).toBe('form_submit');
      expect(sanitizeEventType('download')).toBe('download');
      expect(sanitizeEventType('video_play')).toBe('video_play');
      expect(sanitizeEventType('video_complete')).toBe('video_complete');
      expect(sanitizeEventType('social_share')).toBe('social_share');
      expect(sanitizeEventType('search')).toBe('search');
      expect(sanitizeEventType('filter')).toBe('filter');
      expect(sanitizeEventType('sort')).toBe('sort');
      expect(sanitizeEventType('pagination')).toBe('pagination');
      expect(sanitizeEventType('invalid')).toBe('unknown');
      expect(sanitizeEventType('')).toBe('unknown');
      expect(sanitizeEventType(123 as any)).toBe('unknown');
    });
  });

  describe('sanitizeElementId', () => {
    test('should clean element IDs', () => {
      expect(sanitizeElementId('button-1')).toBe('button-1');
      expect(sanitizeElementId('a'.repeat(101))).toBe('a'.repeat(100));
      expect(sanitizeElementId('')).toBe('');
      expect(sanitizeElementId(123 as any)).toBe('');
    });
  });

  describe('sanitizeElementClass', () => {
    test('should clean element classes', () => {
      expect(sanitizeElementClass('btn primary')).toBe('btn primary');
      expect(sanitizeElementClass('a'.repeat(201))).toBe('a'.repeat(200));
      expect(sanitizeElementClass('')).toBe('');
      expect(sanitizeElementClass(123 as any)).toBe('');
    });
  });

  describe('sanitizeElementText', () => {
    test('should clean element text', () => {
      expect(sanitizeElementText('Click here')).toBe('Click here');
      expect(sanitizeElementText('a'.repeat(501))).toBe('a'.repeat(500));
      expect(sanitizeElementText('')).toBe('');
      expect(sanitizeElementText(123 as any)).toBe('');
    });
  });

  describe('sanitizeCoordinate', () => {
    test('should validate coordinates', () => {
      expect(sanitizeCoordinate(100)).toBe(100);
      expect(sanitizeCoordinate(-50)).toBe(0);
      expect(sanitizeCoordinate(15000)).toBe(10000);
      expect(sanitizeCoordinate('invalid')).toBe(0);
    });
  });

  describe('sanitizeScrollDepth', () => {
    test('should validate scroll depth percentages', () => {
      expect(sanitizeScrollDepth(50)).toBe(50);
      expect(sanitizeScrollDepth(-10)).toBe(0);
      expect(sanitizeScrollDepth(150)).toBe(100);
      expect(sanitizeScrollDepth('invalid')).toBe(0);
    });
  });

  describe('sanitizeEngagementScore', () => {
    test('should validate engagement scores', () => {
      expect(sanitizeEngagementScore(0.75)).toBe(0.75);
      expect(sanitizeEngagementScore(-0.5)).toBe(0);
      expect(sanitizeEngagementScore(1.5)).toBe(1);
      expect(sanitizeEngagementScore('invalid')).toBe(0);
    });
  });

  describe('sanitizeReadCompletion', () => {
    test('should validate read completion percentages', () => {
      expect(sanitizeReadCompletion(0.75)).toBe(0.75);
      expect(sanitizeReadCompletion(-0.5)).toBe(0);
      expect(sanitizeReadCompletion(1.5)).toBe(1);
      expect(sanitizeReadCompletion('invalid')).toBe(0);
    });
  });
});