import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/chat/gemini';

// Mock environment variables
process.env['GOOGLE_AI_API_KEY'] = 'test-api-key';

// Mock fetch
global.fetch = jest.fn();

describe('Gemini API Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Method not allowed'
    });
  });

  it('should return 400 for missing message', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: '',
        sessionId: 'test-session'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Message requis'
    });
  });

  it('should handle successful Gemini API response', async () => {
    // Mock successful Gemini API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{
          content: {
            parts: [{
              text: '[LANG:FR] Bonjour! Comment puis-je vous aider?'
            }]
          }
        }]
      })
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: 'Hello',
        sessionId: 'test-session'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData['language']).toBe('fr');
    expect(responseData.response).toBe('Bonjour! Comment puis-je vous aider?');
  });

  it('should handle Gemini API errors with fallback', async () => {
    // Mock failed Gemini API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: 'Hello',
        sessionId: 'test-session'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData.source).toBe('fallback');
    expect(responseData.response).toContain('problème technique');
  });

  it('should generate suggestions based on message content', async () => {
    // Mock successful Gemini API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{
          content: {
            parts: [{
              text: '[LANG:FR] Voici une réponse de test.'
            }]
          }
        }]
      })
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: 'whatsapp',
        sessionId: 'test-session'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData.suggestions).toBeDefined();
    expect(Array.isArray(responseData.suggestions)).toBe(true);
    expect(responseData.suggestions.length).toBeGreaterThan(0);
  });

  it('should generate CTA based on message content', async () => {
    // Mock successful Gemini API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{
          content: {
            parts: [{
              text: '[LANG:FR] Voici une réponse de test.'
            }]
          }
        }]
      })
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: 'contact',
        sessionId: 'test-session'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData.cta).toBeDefined();
  });
});