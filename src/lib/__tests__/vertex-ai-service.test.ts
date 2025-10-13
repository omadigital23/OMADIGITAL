import { vertexAIService } from '../../lib/vertex-ai-service';

describe('vertexAIService', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn();
    process.env.GOOGLE_AI_API_KEY = 'test-key';
    process.env.GOOGLE_CLOUD_PROJECT_ID = 'test-project';
    process.env.GOOGLE_CLOUD_LOCATION = 'us-central1';
  });

  test('synthesizeText returns a blob URL when Vertex TTS returns audioContent', async () => {
    // Mock Vertex TTS response
    (global as any).fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ audioContent: Buffer.from('dummy-mp3').toString('base64') })
    });

    const url = await vertexAIService.synthesizeText('Hello world', 'en', true);
    expect(url).toBeTruthy();
    expect(typeof url).toBe('string');
    expect((global as any).fetch).toHaveBeenCalledTimes(1);
  });

  test('transcribeAudio returns transcript and confidence for WEBM_OPUS', async () => {
    // Mock Vertex STT response
    (global as any).fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { alternatives: [{ transcript: 'hello vertex', confidence: 0.92 }] }
        ]
      })
    });

    const ab = new ArrayBuffer(8);
    const result = await vertexAIService.transcribeAudio(ab, 'en', { encoding: 'WEBM_OPUS' });
    expect(result.text).toBe('hello vertex');
    expect(result.confidence).toBeCloseTo(0.92);
    expect(result.language).toBe('en');
    expect((global as any).fetch).toHaveBeenCalledTimes(1);
  });

  test('transcribeAudio supports LINEAR16 with sampleRate', async () => {
    (global as any).fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [ { alternatives: [{ transcript: 'bonjour', confidence: 0.85 }] } ]
      })
    });

    const ab = new ArrayBuffer(4);
    const result = await vertexAIService.transcribeAudio(ab, 'fr', { encoding: 'LINEAR16', sampleRateHertz: 16000 });
    expect(result.text).toBe('bonjour');
    expect(result.language).toBe('fr');
  });
});
