// Détection de langue optimisée et externalisée

interface LanguageIndicators {
  words: string[];
  patterns: RegExp[];
  weight: number;
}

// Configuration optimisée pour la détection de langue
const LANGUAGE_CONFIG = {
  fr: {
    words: [
      // Mots courants français (optimisé)
      'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles',
      'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de',
      'bonjour', 'salut', 'bonsoir', 'merci', 'svp', 'stp',
      'comment', 'quoi', 'pourquoi', 'quand', 'où', 'qui', 'combien',
      'prix', 'devis', 'contact', 'site', 'web', 'application',
      'automatisation', 'whatsapp', 'business', 'entreprise',
      'dakar', 'sénégal', 'afrique', 'fcfa', 'cfa'
    ],
    patterns: [
      /\bqu['']/, // qu'est-ce, qu'il
      /\bc['']est/, // c'est
      /\bj['']ai/, // j'ai
      /\bn['']/, // n'est, n'ai
      /\bça\b/, // ça
      /\bvoilà\b/, // voilà
      /tion\b/, // mots en -tion
      /ment\b/, // mots en -ment
      /[àâäéèêëïîôöùûüÿç]/ // caractères accentués français
    ],
    weight: 1
  },
  en: {
    words: [
      // Mots courants anglais (optimisé)
      'i', 'you', 'he', 'she', 'we', 'they', 'it',
      'the', 'a', 'an', 'this', 'that', 'these', 'those',
      'hello', 'hi', 'hey', 'good', 'thanks', 'please',
      'what', 'how', 'why', 'when', 'where', 'who', 'which',
      'price', 'quote', 'contact', 'website', 'application',
      'automation', 'business', 'company', 'enterprise',
      'senegal', 'africa', 'digital', 'technology'
    ],
    patterns: [
      /\bi['']m\b/, // I'm
      /\byou['']re\b/, // you're
      /\bit['']s\b/, // it's
      /\bdon['']t\b/, // don't
      /\bcan['']t\b/, // can't
      /\bwon['']t\b/, // won't
      /\baren['']t\b/, // aren't
      /\bisn['']t\b/, // isn't
      /\bdoesn['']t\b/, // doesn't
      /\bdidn['']t\b/, // didn't
      /ing\b/, // mots en -ing
      /\bthe\b/ // the (très commun)
    ],
    weight: 1
  }
} as const;

// Cache pour optimiser les performances
const detectionCache = new Map<string, 'fr' | 'en'>();
const CACHE_SIZE_LIMIT = 1000;

/**
 * Détecte la langue d'un texte de manière optimisée
 */
export function detectLanguage(text: string): 'fr' | 'en' {
  if (!text || text.trim().length === 0) {
    return 'fr'; // Défaut pour le marché sénégalais
  }

  const normalizedText = text.toLowerCase().trim();
  
  // Vérifier le cache
  if (detectionCache.has(normalizedText)) {
    return detectionCache.get(normalizedText)!;
  }

  // Détection prioritaire pour les salutations courantes
  const commonGreetings = {
    fr: ['bonjour', 'salut', 'bonsoir', 'bonne soirée', 'bonne nuit'],
    en: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon']
  };

  for (const [lang, greetings] of Object.entries(commonGreetings)) {
    for (const greeting of greetings) {
      if (normalizedText === greeting || 
          normalizedText.startsWith(greeting + ' ') || 
          normalizedText.endsWith(' ' + greeting)) {
        const result = lang as 'fr' | 'en';
        cacheResult(normalizedText, result);
        return result;
      }
    }
  }

  // Calcul des scores
  const scores = calculateLanguageScores(normalizedText);
  
  // Logique de décision améliorée
  const result = determineLanguage(scores, normalizedText);
  
  // Mise en cache du résultat
  cacheResult(normalizedText, result);
  
  return result;
}

/**
 * Calcule les scores pour chaque langue
 */
function calculateLanguageScores(text: string): Record<'fr' | 'en', number> {
  const scores = { fr: 0, en: 0 };

  for (const [lang, config] of Object.entries(LANGUAGE_CONFIG)) {
    const langKey = lang as 'fr' | 'en';
    
    // Score basé sur les mots
    for (const word of config.words) {
      const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        const weight = word.length > 4 ? 2 : 1;
        scores[langKey] += matches.length * weight;
      }
    }
    
    // Score basé sur les patterns
    for (const pattern of config.patterns) {
      const matches = text.match(pattern);
      if (matches) {
        scores[langKey] += matches.length * 3;
      }
    }
  }

  return scores;
}

/**
 * Détermine la langue finale basée sur les scores
 */
function determineLanguage(scores: Record<'fr' | 'en', number>, text: string): 'fr' | 'en' {
  const { fr: frScore, en: enScore } = scores;
  
  // Cas spéciaux
  const hasFrenchAccents = /[àâäéèêëïîôöùûüÿç]/.test(text);
  const hasEnglishContractions = /\b\w+'(s|t|re|ve|ll|d|m)\b/.test(text);
  
  if (hasFrenchAccents && !hasEnglishContractions) {
    return 'fr';
  }
  
  if (hasEnglishContractions && !hasFrenchAccents) {
    return 'en';
  }
  
  // Si les scores sont proches, privilégier le français (marché sénégalais)
  const scoreDifference = Math.abs(enScore - frScore);
  if (scoreDifference < 3) {
    // Pour les textes courts, vérifier s'ils sont clairement anglais
    if (text.length < 10) {
      // Pour les textes très courts, vérifier s'ils sont dans la liste des mots anglais courants
      const commonEnglishWords = ['hi', 'hello', 'hey', 'thanks', 'please'];
      if (commonEnglishWords.includes(text.toLowerCase())) {
        return 'en';
      }
    }
    return 'fr';
  }
  
  // Retourner la langue avec le score le plus élevé
  return enScore > frScore ? 'en' : 'fr';
}

/**
 * Met en cache le résultat de détection
 */
function cacheResult(text: string, language: 'fr' | 'en'): void {
  if (detectionCache.size >= CACHE_SIZE_LIMIT) {
    // Supprimer les entrées les plus anciennes
    const firstKey = detectionCache.keys().next().value;
    if (firstKey !== undefined) {
      detectionCache.delete(firstKey);
    }
  }
  detectionCache.set(text, language);
}

/**
 * Échappe les caractères spéciaux pour les regex
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Détecte la langue d'un texte en utilisant exclusivement l'API Google AI Studio (Gemini)
 * Cette fonction remplace la détection locale par une détection basée sur l'API
 */
export async function detectLanguageWithGoogleAPI(text: string): Promise<'fr' | 'en'> {
  try {
    // Préparer le texte pour la détection
    const preparedText = prepareTextForLanguageDetection(text);
    
    if (!preparedText || preparedText.trim().length === 0) {
      return 'fr'; // Défaut pour le marché sénégalais
    }

    // Appeler l'API de détection de langue
    const response = await fetch('/api/language/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: preparedText.substring(0, 500) }) // Limiter la longueur pour l'API
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.language) {
        const detectedLanguage = data.language === 'en' ? 'en' : 'fr';
        console.log('🎵 Language detected with Google API:', detectedLanguage);
        return detectedLanguage;
      }
    }
    
    // En cas d'erreur, utiliser la détection locale comme fallback
    console.warn('Google language detection failed, using local detection as fallback');
    const fallbackLanguage = detectLanguage(text);
    console.log('🎵 Language detected with fallback:', fallbackLanguage);
    return fallbackLanguage;
  } catch (error) {
    console.error('Language detection API error:', error);
    // En cas d'erreur API, utiliser la détection locale comme fallback
    const fallbackLanguage = detectLanguage(text);
    console.log('🎵 Language detected with fallback after error:', fallbackLanguage);
    return fallbackLanguage;
  }
}

/**
 * Combine la détection API avec la détection interne
 * Pour l'intégration avec Google AI Studio, on privilégie la détection côté API
 */
export async function combineLanguageDetection(
  apiLanguage: string | undefined, 
  text: string
): Promise<'fr' | 'en'> {
  // Utiliser toujours la détection Google API pour l'exclusivité
  return await detectLanguageWithGoogleAPI(text);
}

/**
 * Nettoie le cache de détection (utile pour les tests)
 */
export function clearDetectionCache(): void {
  detectionCache.clear();
}

/**
 * Prépare le texte pour la détection de langue par Google AI Studio
 * Enlève les éléments qui pourraient perturber la détection
 */
export function prepareTextForLanguageDetection(text: string): string {
  // Enlever les URLs, emails et numéros de téléphone
  return text
    .replace(/https?:\/\/[^\s]+/g, '') // URLs
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '') // Emails
    .replace(/\+?[0-9][\d\s\-\(\)]{7,}/g, '') // Numéros de téléphone
    .replace(/\s+/g, ' ') // Normaliser les espaces
    .trim();
}