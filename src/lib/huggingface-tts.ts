/**
 * Service Text-to-Speech avec Hugging Face API
 * Utilise un modèle TTS plus accessible via notre propre API
 */

class HuggingFaceTTSService {
  private audioCache = new Map<string, string>(); // Cache des URLs audio

  /**
   * Génère un hash pour le cache basé sur le texte
   */
  private generateCacheKey(text: string): string {
    return btoa(encodeURIComponent(text)).slice(0, 20);
  }

  /**
   * Nettoie le texte pour optimiser la synthèse vocale
   */
  private cleanTextForTTS(text: string): string {
    return text
      // Remplacer les émojis par des mots
      .replace(/🚀/g, ' fusée ')
      .replace(/💡/g, ' ampoule ')
      .replace(/✅/g, ' vérifié ')
      .replace(/❌/g, ' erreur ')
      .replace(/🎯/g, ' cible ')
      .replace(/📱/g, ' téléphone ')
      .replace(/💬/g, ' message ')
      // Améliorer la prononciation
      .replace(/WhatsApp/g, 'WhatsApp')
      .replace(/IA/g, 'I.A.')
      .replace(/ROI/g, 'R.O.I.')
      .replace(/SEO/g, 'S.E.O.')
      .replace(/PME/g, 'P.M.E.')
      .replace(/FCFA/g, 'francs CFA')
      // Nettoyer les caractères spéciaux
      .replace(/[*_`]/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Synthétise le texte en audio avec fallback vers browser TTS
   */
  async synthesizeText(
    text: string, 
    language: 'fr' | 'en' = 'en'
  ): Promise<string | null> {
    const cleanText = this.cleanTextForTTS(text);
    
    if (!cleanText.trim()) {
      return null;
    }

    const cacheKey = this.generateCacheKey(cleanText);
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    try {
      const response = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanText,
          language: language
        })
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`);
      }

      const data = await response.json();
      
      // If API suggests using browser TTS, return special flag
      if (data.useBrowserTTS) {
        return 'USE_BROWSER_TTS';
      }

      if (!data.success || !data.audio) {
        throw new Error('TTS synthesis failed');
      }

      const byteCharacters = atob(data.audio);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);

      this.audioCache.set(cacheKey, audioUrl);

      if (this.audioCache.size > 50) {
        const firstKey = this.audioCache.keys().next().value;
        if (firstKey) {
          const oldUrl = this.audioCache.get(firstKey);
          if (oldUrl) {
            URL.revokeObjectURL(oldUrl);
          }
          this.audioCache.delete(firstKey);
        }
      }

      return audioUrl;

    } catch (error) {
      console.warn('TTS API failed, using browser TTS:', error);
      return 'USE_BROWSER_TTS';
    }
  }

  /**
   * Joue l'audio synthétisé avec fallback pour les anciens navigateurs
   */
  async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Vérifier la compatibilité du navigateur
      if (typeof Audio === 'undefined') {
        console.warn('Audio API not supported in this browser');
        // Fallback: créer un élément audio dans le DOM
        const audioElement = document.createElement('audio');
        audioElement.src = audioUrl;
        audioElement.style.display = 'none';
        document.body.appendChild(audioElement);
        
        const onEnded = () => {
          document.body.removeChild(audioElement);
          resolve();
        };
        
        const onError = (error: any) => {
          document.body.removeChild(audioElement);
          console.error('Audio playback error:', error);
          reject(error);
        };
        
        audioElement.addEventListener('ended', onEnded, { once: true });
        audioElement.addEventListener('error', onError, { once: true });
        audioElement.play().catch(reject);
        return;
      }
      
      const audio = new Audio(audioUrl);
      
      // Gestion des événements pour une meilleure compatibilité
      audio.addEventListener('ended', () => resolve(), { once: true });
      audio.addEventListener('error', (error) => {
        console.error('Audio playback error:', error);
        // Essayer une approche alternative
        try {
          // Fallback: créer un nouvel élément audio
          const fallbackAudio = document.createElement('audio');
          fallbackAudio.src = audioUrl;
          fallbackAudio.onended = () => resolve();
          fallbackAudio.onerror = (e) => {
            console.error('Fallback audio error:', e);
            reject(error);
          };
          document.body.appendChild(fallbackAudio);
          fallbackAudio.play().catch(reject);
          setTimeout(() => {
            if (document.body.contains(fallbackAudio)) {
              document.body.removeChild(fallbackAudio);
            }
            resolve();
          }, 5000); // Timeout après 5 secondes
        } catch (fallbackError) {
          console.error('Audio fallback error:', fallbackError);
          reject(error);
        }
      }, { once: true });
      
      // Pour les anciens navigateurs qui ne supportent pas Promise
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Audio is playing
        }).catch((error) => {
          console.error('Audio play error:', error);
          // Fallback: try to play without promise handling
          try {
            audio.play();
            setTimeout(() => resolve(), 3000); // Resolve after 3 seconds as fallback
          } catch (fallbackError) {
            console.error('Audio play fallback error:', fallbackError);
            // Dernier fallback: créer un élément audio dans le DOM
            try {
              const lastResortAudio = document.createElement('audio');
              lastResortAudio.src = audioUrl;
              lastResortAudio.style.display = 'none';
              document.body.appendChild(lastResortAudio);
              lastResortAudio.play().catch(() => {});
              setTimeout(() => {
                if (document.body.contains(lastResortAudio)) {
                  document.body.removeChild(lastResortAudio);
                }
                resolve();
              }, 3000);
            } catch (lastError) {
              console.error('Last resort audio error:', lastError);
              reject(fallbackError);
            }
          }
        });
      } else {
        // Pour les très anciens navigateurs
        try {
          audio.play();
          setTimeout(() => resolve(), 3000);
        } catch (error) {
          console.error('Legacy audio play error:', error);
          reject(error);
        }
      }
    });
  }

  /**
   * Synthétise et joue le texte avec fallback vers browser TTS
   */
  async speakText(
    text: string, 
    language: 'fr' | 'en' = 'en'
  ): Promise<boolean> {
    try {
      const audioUrl = await this.synthesizeText(text, language);
      
      if (!audioUrl) {
        return false;
      }

      // Use browser TTS if API suggests it
      if (audioUrl === 'USE_BROWSER_TTS') {
        return await this.useBrowserTTS(text, language);
      }

      await this.playAudio(audioUrl);
      return true;

    } catch (error) {
      console.error('TTS Speak Error:', error);
      return await this.useBrowserTTS(text, language);
    }
  }

  /**
   * Fallback vers l'API native du navigateur
   */
  private async useBrowserTTS(text: string, language: 'fr' | 'en' = 'en'): Promise<boolean> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        console.warn('Browser TTS not supported');
        resolve(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(this.cleanTextForTTS(text));
      utterance.lang = language === 'fr' ? 'fr-FR' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);

      speechSynthesis.speak(utterance);
    });
  }

  /**
   * Nettoie le cache audio
   */
  clearCache() {
    this.audioCache.forEach(url => URL.revokeObjectURL(url));
    this.audioCache.clear();
  }

  /**
   * Vérifie si le service est disponible
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && 
           (typeof fetch !== 'undefined' || 'speechSynthesis' in window);
  }
}

// Instance singleton
export const huggingFaceTTS = new HuggingFaceTTSService();