/**
 * Vertex AI Service pour Chatbot OMA Digital
 * 100% Vertex AI - Utilise .env.local pour les credentials
 */

import { GoogleAuth } from 'google-auth-library';

interface VertexAIResponse {
  answer: string;
  language: 'fr' | 'en';
}

class VertexAIChatbot {
  private auth: GoogleAuth;
  private projectId: string;
  private location: string;
  private model: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    // Reconstruire credentials depuis variables GOOGLE_SERVICE_ACCOUNT_* de .env.local
    const serviceAccountType = process.env['GOOGLE_SERVICE_ACCOUNT_TYPE'];
    const serviceAccountProjectId = process.env['GOOGLE_SERVICE_ACCOUNT_PROJECT_ID'];
    const serviceAccountPrivateKey = process.env['GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY'];
    const serviceAccountClientEmail = process.env['GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL'];
    
    if (serviceAccountType && serviceAccountProjectId && serviceAccountPrivateKey && serviceAccountClientEmail) {
      // Reconstruire le JSON credentials
      const credentials = {
        type: serviceAccountType,
        project_id: serviceAccountProjectId,
        private_key_id: process.env['GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID'] || '',
        private_key: serviceAccountPrivateKey.replace(/\\n/g, '\n'), // Convertir \\n en \n
        client_email: serviceAccountClientEmail,
        client_id: process.env['GOOGLE_SERVICE_ACCOUNT_CLIENT_ID'] || '',
        auth_uri: process.env['GOOGLE_SERVICE_ACCOUNT_AUTH_URI'] || 'https://accounts.google.com/o/oauth2/auth',
        token_uri: process.env['GOOGLE_SERVICE_ACCOUNT_TOKEN_URI'] || 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: process.env['GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL'] || 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env['GOOGLE_SERVICE_ACCOUNT_CLIENT_CERT_URL'] || '',
        universe_domain: process.env['GOOGLE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN'] || 'googleapis.com'
      };
      
      this.auth = new GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });
      this.projectId = serviceAccountProjectId;
    } else {
      throw new Error('Vertex AI credentials incomplete. Check GOOGLE_SERVICE_ACCOUNT_* variables in .env.local');
    }

    this.location = process.env['GOOGLE_CLOUD_LOCATION'] || process.env['VERTEX_AI_LOCATION'] || 'us-central1';
    this.model = process.env['VERTEX_AI_MODEL'] || 'gemini-2.0-flash-exp'; // Modèle qui fonctionne

    console.log('✅ Vertex AI initialized');
    console.log(`   Project: ${this.projectId}`);
    console.log(`   Location: ${this.location}`);
    console.log(`   Model: ${this.model}`);
  }

  /**
   * Obtenir access token (avec cache)
   */
  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    
    if (this.accessToken && now < this.tokenExpiry) {
      return this.accessToken;
    }

    const client = await this.auth.getClient();
    const tokenResponse = await client.getAccessToken();
    
    if (!tokenResponse.token) {
      throw new Error('Failed to get access token');
    }

    this.accessToken = tokenResponse.token;
    this.tokenExpiry = now + (55 * 60 * 1000);
    
    return this.accessToken;
  }

  /**
   * Appeler Vertex AI Gemini
   */
  async generateContent(prompt: string, retryCount = 0): Promise<{ answer: string; language: 'fr' | 'en' }> {
    const maxRetries = 7; // Augmenté à 7 pour gérer les quotas stricts (délais: 5s, 10s, 20s, 40s, 80s, 160s, 320s)
    
    try {
      console.log('🚀 Vertex AI: Generating content...', retryCount > 0 ? `(Retry ${retryCount}/${maxRetries})` : '');
      
      const token = await this.getAccessToken();
      const endpoint = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.model}:generateContent`;
      
      console.log('🎯 Vertex AI: Endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150, // Réduit pour réponses plus courtes
            topP: 0.9,
            topK: 40
          }
        })
      });

      console.log('📡 Vertex AI: Response status:', response.status);

      // Gestion du quota 429 - Retry avec exponential backoff amélioré
      if (response.status === 429) {
        const errorData = await response.json();
        console.warn('⚠️ Vertex AI: Quota exceeded (429)');
        
        if (retryCount < maxRetries) {
          // Exponential backoff plus agressif: 5s, 10s, 20s, 40s, 80s
          const delay = Math.pow(2, retryCount) * 5000; // Commence à 5s au lieu de 3s
          console.log(`⏳ Waiting ${delay}ms before retry (attempt ${retryCount + 1}/${maxRetries})...`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.generateContent(prompt, retryCount + 1);
        }
        
        // Si toutes les tentatives échouent, lancer une erreur (pas de fallback générique)
        console.error('❌ Max retries reached for quota 429');
        throw new Error(`Vertex AI quota exceeded after ${maxRetries} retries: ${JSON.stringify(errorData)}`);
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Vertex AI Error:', errorData);
        throw new Error(`Vertex AI error ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const fullResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return this.parseResponse(fullResponse);
    } catch (error) {
      console.error('❌ Vertex AI Exception:', error);
      throw error;
    }
  }


  /**
   * Parser la réponse et extraire la langue
   * Limite automatiquement à 8 phrases maximum
   */
  private parseResponse(fullResponse: string): VertexAIResponse {
    const langMatch = fullResponse.match(/\[LANG:(FR|EN)\]/i);
    const detectedLang: 'fr' | 'en' = langMatch?.[1]?.toUpperCase() === 'EN' ? 'en' : 'fr';

    let cleanAnswer = fullResponse
      .replace(/\[LANG:(FR|EN)\]\s*/i, '')
      .trim();

    // Limiter à 8 phrases maximum
    cleanAnswer = this.limitToMaxSentences(cleanAnswer, 8);

    return {
      answer: cleanAnswer || (detectedLang === 'en' ? 'No response.' : 'Pas de réponse.'),
      language: detectedLang
    };
  }

  /**
   * Limiter le texte à un nombre maximum de phrases
   */
  private limitToMaxSentences(text: string, maxSentences: number): string {
    // Découper en phrases (., !, ?)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    if (sentences.length <= maxSentences) {
      return text;
    }
    
    // Prendre les N premières phrases
    const limitedText = sentences.slice(0, maxSentences).join(' ');
    console.log(`✂️ Réponse limitée à ${maxSentences} phrases (${sentences.length} → ${maxSentences})`);
    
    return limitedText;
  }
}

// Export singleton
export const vertexAIChatbot = new VertexAIChatbot();
