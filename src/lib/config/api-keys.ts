/**
 * Configuration centralisée des clés API
 */

export const apiConfig = {
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY || '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', // Fallback for development
    baseUrl: 'https://api-inference.huggingface.co',
    models: {
      stt: 'openai/whisper-large-v3',
      fallbackSTT: 'facebook/wav2vec2-large-960h'
    }
  },
  google: {
    apiKey: process.env.GOOGLE_AI_API_KEY || ''
  }
};

export type HFModel = keyof typeof apiConfig.huggingface.models;