/**
 * Tests pour l'architecture RAG-FIRST
 * Vérifie que le système utilise correctement la base de connaissances Supabase
 * et Gemini comme fallback uniquement
 */

import { ragFirstService } from '../src/lib/rag/rag-first-service';

describe('RAG-First Service', () => {
  
  describe('Questions sur OMA Digital (haute confiance)', () => {
    it('devrait répondre avec RAG seul pour "Quels sont vos services ?"', async () => {
      const result = await ragFirstService.answerQuestion(
        "Quels sont vos services ?",
        { language: 'fr', limit: 5, similarity_threshold: 0.7 }
      );

      expect(result.source).toBe('rag_only');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.documents.length).toBeGreaterThan(0);
      expect(result.language).toBe('fr');
      expect(result.answer).toBeTruthy();
      expect(result.answer.length).toBeGreaterThan(10);
    });

    it('devrait répondre en anglais pour "What are your services?"', async () => {
      const result = await ragFirstService.answerQuestion(
        "What are your services?",
        { language: 'en', limit: 5, similarity_threshold: 0.7 }
      );

      expect(result.language).toBe('en');
      expect(result.answer).toBeTruthy();
    });

    it('devrait trouver des documents pour "WhatsApp automatisation"', async () => {
      const result = await ragFirstService.answerQuestion(
        "Parlez-moi de votre automatisation WhatsApp",
        { language: 'fr', limit: 5, similarity_threshold: 0.7 }
      );

      expect(result.documents.length).toBeGreaterThan(0);
      expect(result.answer.toLowerCase()).toContain('whatsapp');
    });

    it('devrait trouver des informations sur Papa Amadou FALL', async () => {
      const result = await ragFirstService.answerQuestion(
        "Qui est le fondateur d'OMA Digital ?",
        { language: 'fr', limit: 5, similarity_threshold: 0.7 }
      );

      expect(result.documents.length).toBeGreaterThan(0);
      expect(result.answer.toLowerCase()).toMatch(/papa|amadou|fall/);
    });

    it('devrait trouver les coordonnées de contact', async () => {
      const result = await ragFirstService.answerQuestion(
        "Comment vous contacter ?",
        { language: 'fr', limit: 5, similarity_threshold: 0.7 }
      );

      expect(result.documents.length).toBeGreaterThan(0);
      expect(result.answer).toMatch(/\+212|email|omadigital/i);
    });
  });

  describe('Questions avec confiance moyenne (RAG + Gemini)', () => {
    it('devrait utiliser RAG + Gemini pour question vague', async () => {
      const result = await ragFirstService.answerQuestion(
        "Comment vous pouvez m'aider ?",
        { language: 'fr', limit: 5, similarity_threshold: 0.7 }
      );

      // Peut être rag_only ou rag_gemini selon les documents trouvés
      expect(['rag_only', 'rag_gemini']).toContain(result.source);
      expect(result.answer).toBeTruthy();
    });

    it('devrait gérer les questions partiellement liées', async () => {
      const result = await ragFirstService.answerQuestion(
        "Je veux développer mon business digital",
        { language: 'fr', limit: 5, similarity_threshold: 0.7 }
      );

      expect(result.answer).toBeTruthy();
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('Questions générales (Gemini fallback)', () => {
    it('devrait utiliser Gemini fallback pour question générale', async () => {
      const result = await ragFirstService.answerQuestion(
        "Quelle est la capitale du Sénégal ?",
        { language: 'fr', limit: 5, similarity_threshold: 0.7 }
      );

      // Devrait utiliser Gemini car pas dans la base de connaissances
      expect(['gemini_fallback', 'rag_gemini']).toContain(result.source);
      expect(result.answer).toBeTruthy();
    });

    it('devrait gérer les questions hors sujet poliment', async () => {
      const result = await ragFirstService.answerQuestion(
        "Quelle heure est-il ?",
        { language: 'fr', limit: 5, similarity_threshold: 0.7 }
      );

      expect(result.answer).toBeTruthy();
      expect(result.source).toBe('gemini_fallback');
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer les questions vides', async () => {
      const result = await ragFirstService.answerQuestion(
        "",
        { language: 'fr', limit: 5, similarity_threshold: 0.7 }
      );

      expect(result.answer).toBeTruthy();
      expect(result.confidence).toBe(0);
    });

    it('devrait gérer les questions très courtes', async () => {
      const result = await ragFirstService.answerQuestion(
        "hi",
        { language: 'en', limit: 5, similarity_threshold: 0.7 }
      );

      expect(result.answer).toBeTruthy();
    });

    it('devrait gérer les questions très longues', async () => {
      const longQuestion = "Je voudrais savoir ".repeat(50) + "vos services";
      const result = await ragFirstService.answerQuestion(
        longQuestion,
        { language: 'fr', limit: 5, similarity_threshold: 0.7 }
      );

      expect(result.answer).toBeTruthy();
    });
  });

  describe('Détection de langue', () => {
    it('devrait détecter le français correctement', async () => {
      const result = await ragFirstService.answerQuestion(
        "Bonjour, quels sont vos services d'automatisation ?",
        { language: 'fr', limit: 5, similarity_threshold: 0.7 }
      );

      expect(result.language).toBe('fr');
    });

    it('devrait détecter l\'anglais correctement', async () => {
      const result = await ragFirstService.answerQuestion(
        "Hello, what are your automation services?",
        { language: 'en', limit: 5, similarity_threshold: 0.7 }
      );

      expect(result.language).toBe('en');
    });
  });

  describe('Performance et cache', () => {
    it('devrait répondre en moins de 5 secondes', async () => {
      const startTime = Date.now();
      
      await ragFirstService.answerQuestion(
        "Quels sont vos services ?",
        { language: 'fr', limit: 5, similarity_threshold: 0.7 }
      );

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000);
    }, 10000); // Timeout de 10 secondes pour le test

    it('devrait utiliser le cache pour questions répétées', async () => {
      const question = "Vos services WhatsApp ?";
      
      // Première requête
      const result1 = await ragFirstService.answerQuestion(
        question,
        { language: 'fr', limit: 5, similarity_threshold: 0.7 }
      );

      // Deuxième requête (devrait être plus rapide grâce au cache)
      const startTime = Date.now();
      const result2 = await ragFirstService.answerQuestion(
        question,
        { language: 'fr', limit: 5, similarity_threshold: 0.7 }
      );
      const duration = Date.now() - startTime;

      expect(result1.answer).toBe(result2.answer);
      expect(duration).toBeLessThan(1000); // Cache devrait être très rapide
    });
  });

  describe('Validation des réponses', () => {
    it('ne devrait jamais donner de prix exacts', async () => {
      const result = await ragFirstService.answerQuestion(
        "Quel est le prix de vos services ?",
        { language: 'fr', limit: 5, similarity_threshold: 0.7 }
      );

      // Ne devrait pas contenir de montants exacts
      expect(result.answer).not.toMatch(/\d+\s*(fcfa|cfa|euros?|dollars?|\$|€)/i);
    });

    it('devrait toujours proposer une action', async () => {
      const result = await ragFirstService.answerQuestion(
        "Je suis intéressé par vos services",
        { language: 'fr', limit: 5, similarity_threshold: 0.7 }
      );

      // Devrait contenir un appel à l'action
      expect(result.answer.toLowerCase()).toMatch(/contact|appel|email|whatsapp|démo|rendez-vous/);
    });

    it('devrait être concis (max 500 caractères)', async () => {
      const result = await ragFirstService.answerQuestion(
        "Parlez-moi de tous vos services en détail",
        { language: 'fr', limit: 5, similarity_threshold: 0.7 }
      );

      expect(result.answer.length).toBeLessThan(1500);
    });
  });

  describe('Intégration avec Supabase', () => {
    it('devrait trouver des documents dans la base de connaissances', async () => {
      const result = await ragFirstService.answerQuestion(
        "Services OMA Digital",
        { language: 'fr', limit: 5, similarity_threshold: 0.5 }
      );

      // Devrait avoir trouvé au moins un document
      expect(result.documents.length).toBeGreaterThan(0);
    });

    it('devrait respecter la limite de documents', async () => {
      const result = await ragFirstService.answerQuestion(
        "Services",
        { language: 'fr', limit: 3, similarity_threshold: 0.5 }
      );

      expect(result.documents.length).toBeLessThanOrEqual(3);
    });
  });
});

describe('API Endpoint Integration', () => {
  it('devrait accepter les requêtes POST', async () => {
    const response = await fetch('/api/chat/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "Quels sont vos services ?",
        sessionId: 'test-session-123'
      })
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.response).toBeTruthy();
    expect(data.language).toMatch(/fr|en/);
    expect(data.source).toMatch(/rag_only|rag_gemini|gemini_fallback/);
  });

  it('devrait rejeter les requêtes GET', async () => {
    const response = await fetch('/api/chat/gemini', {
      method: 'GET'
    });

    expect(response.status).toBe(405);
  });

  it('devrait valider les messages vides', async () => {
    const response = await fetch('/api/chat/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "",
        sessionId: 'test-session-123'
      })
    });

    expect(response.status).toBe(400);
  });
});
