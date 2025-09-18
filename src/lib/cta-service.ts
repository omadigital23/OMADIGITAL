/**
 * Service CTA optimisé avec cache et analytics
 */

import { createClient } from '@supabase/supabase-js';
import { CTAAction, CTATracking } from '../components/SmartChatbot/types';

interface CTAMetrics {
  total_views: number;
  total_clicks: number;
  total_conversions: number;
  click_rate: number;
  conversion_rate: number;
}

class CTAService {
  private supabase;
  private cache = new Map<string, CTAAction[]>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Récupère les CTAs actifs avec cache
   */
  async getActiveCTAs(language?: 'fr' | 'en'): Promise<CTAAction[]> {
    const cacheKey = `ctas_${language || 'all'}`;
    const now = Date.now();

    // Vérifier le cache
    if (this.cache.has(cacheKey) && 
        this.cacheExpiry.has(cacheKey) && 
        this.cacheExpiry.get(cacheKey)! > now) {
      return this.cache.get(cacheKey)!;
    }

    try {
      let query = this.supabase
        .from('cta_actions')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      // Filtrer par langue si spécifiée
      if (language) {
        query = query.or(`conditions->language.eq.${language},conditions->language.eq.both`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const ctas = data || [];
      
      // Mettre en cache
      this.cache.set(cacheKey, ctas);
      this.cacheExpiry.set(cacheKey, now + this.CACHE_DURATION);

      return ctas;
    } catch (error) {
      console.error('Erreur lors de la récupération des CTAs:', error);
      return [];
    }
  }

  /**
   * Trouve le meilleur CTA pour un message donné
   */
  async findBestCTA(message: string, language: 'fr' | 'en'): Promise<CTAAction | null> {
    const ctas = await this.getActiveCTAs(language);
    const messageLower = message.toLowerCase();

    // Scorer chaque CTA
    const scoredCTAs = ctas.map(cta => ({
      cta,
      score: this.calculateCTAScore(cta, messageLower, language)
    })).filter(item => item.score > 0);

    // Trier par score décroissant
    scoredCTAs.sort((a, b) => b.score - a.score);

    return scoredCTAs.length > 0 ? scoredCTAs[0].cta : null;
  }

  /**
   * Calcule le score de pertinence d'un CTA
   */
  private calculateCTAScore(cta: CTAAction, message: string, language: 'fr' | 'en'): number {
    let score = 0;

    // Vérifier les mots-clés
    const keywords = cta.conditions?.keywords || [];
    const keywordMatches = keywords.filter(keyword => 
      message.includes(keyword.toLowerCase())
    ).length;
    
    score += keywordMatches * 10;

    // Bonus pour la langue
    const ctaLanguage = cta.conditions?.language;
    if (ctaLanguage === language || ctaLanguage === 'both') {
      score += 5;
    }

    // Bonus pour la priorité
    switch (cta.priority) {
      case 'urgent': score += 15; break;
      case 'high': score += 10; break;
      case 'medium': score += 5; break;
      case 'low': score += 2; break;
    }

    return score;
  }

  /**
   * Track une action CTA
   */
  async trackCTAAction(
    ctaId: string,
    sessionId: string,
    actionType: 'view' | 'click' | 'conversion',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.supabase
        .from('cta_tracking')
        .insert({
          cta_id: ctaId,
          session_id: sessionId,
          action_type: actionType,
          user_agent: typeof window !== 'undefined' ? navigator.userAgent : null,
          metadata: metadata || {}
        });
    } catch (error) {
      console.error('Erreur lors du tracking CTA:', error);
    }
  }

  /**
   * Enregistre une conversion CTA
   */
  async recordCTAConversion(
    ctaId: string,
    sessionId: string,
    conversionType: string,
    value?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.supabase
        .from('cta_conversions')
        .insert({
          cta_id: ctaId,
          session_id: sessionId,
          conversion_type: conversionType,
          conversion_value: value,
          metadata: metadata || {}
        });

      // Aussi tracker comme action
      await this.trackCTAAction(ctaId, sessionId, 'conversion', metadata);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de conversion:', error);
    }
  }

  /**
   * Récupère les métriques d'un CTA
   */
  async getCTAMetrics(ctaId: string): Promise<CTAMetrics | null> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_cta_metrics', { cta_uuid: ctaId });

      if (error) throw error;

      return data?.[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques:', error);
      return null;
    }
  }

  /**
   * Crée ou met à jour un CTA
   */
  async upsertCTA(cta: Partial<CTAAction>): Promise<CTAAction | null> {
    try {
      const { data, error } = await this.supabase
        .from('cta_actions')
        .upsert(cta)
        .select()
        .single();

      if (error) throw error;

      // Invalider le cache
      this.cache.clear();
      this.cacheExpiry.clear();

      return data;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du CTA:', error);
      return null;
    }
  }

  /**
   * Supprime un CTA
   */
  async deleteCTA(ctaId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('cta_actions')
        .delete()
        .eq('id', ctaId);

      if (error) throw error;

      // Invalider le cache
      this.cache.clear();
      this.cacheExpiry.clear();

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du CTA:', error);
      return false;
    }
  }

  /**
   * Récupère les analytics des CTAs
   */
  async getCTAAnalytics(dateFrom?: string, dateTo?: string): Promise<any[]> {
    try {
      let query = this.supabase
        .from('cta_tracking')
        .select(`
          *,
          cta_actions (
            type,
            action,
            priority
          )
        `)
        .order('created_at', { ascending: false });

      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics:', error);
      return [];
    }
  }

  /**
   * Invalide le cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

// Export singleton
export const ctaService = new CTAService();