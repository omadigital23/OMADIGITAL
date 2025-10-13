import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL } from '../../../src/lib/env-public';
import { SUPABASE_SERVICE_ROLE_KEY } from '../../../src/lib/env-server';

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Paramètres de pagination
    const limit = parseInt(req.query['limit'] as string) || 50;
    const offset = parseInt(req.query['offset'] as string) || 0;

    // Récupérer les conversations récentes du chatbot depuis chatbot_conversations
    const { data: interactions, error: interactionsError } = await supabase
      .from('chatbot_conversations')
      .select(`
        id,
        session_id,
        user_message,
        bot_response,
        language,
        input_type,
        confidence,
        created_at,
        ip_address,
        user_agent,
        sentiment,
        lead_score
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (interactionsError) {
      console.error('Erreur récupération interactions:', interactionsError);
    }

    // Calculer les statistiques
    const { data: statsData, error: statsError } = await supabase
      .from('chatbot_conversations')
      .select('confidence, language, input_type, created_at, lead_score');

    if (statsError) {
      console.error('Erreur récupération stats:', statsError);
    }

    // Traitement des statistiques
    let stats = null;
    if (statsData && statsData.length > 0) {
      // Calculs de base
      const totalInteractions = statsData.length;
      const avgConfidence = statsData.reduce((sum, item) => sum + (item.confidence || 0), 0) / totalInteractions;
      const avgLeadScore = statsData.filter(item => item.lead_score).reduce((sum, item) => sum + (item.lead_score || 0), 0) / (statsData.filter(item => item.lead_score).length || 1);

      // Répartition par langue
      const languages = statsData.reduce((acc, item) => {
        const lang = item['language'] || 'unknown';
        acc[lang] = (acc[lang] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Répartition par type d'input
      const inputTypes = statsData.reduce((acc, item) => {
        const inputType = item.input_type || 'text';
        acc[inputType] = (acc[inputType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Interactions des dernières 24h
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const dailyInteractions = statsData.filter(item => 
        item.created_at && new Date(item.created_at) > new Date(oneDayAgo)
      ).length;

      // Interactions des 7 derniers jours
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const weeklyInteractions = statsData.filter(item => 
        item.created_at && new Date(item.created_at) > new Date(oneWeekAgo)
      ).length;

      stats = {
        total_interactions: totalInteractions,
        avg_confidence: avgConfidence,
        avg_response_time: 0, // Not tracked in new table
        avg_lead_score: avgLeadScore,
        languages,
        input_types: inputTypes,
        daily_interactions: dailyInteractions,
        weekly_interactions: weeklyInteractions
      };
    }

    return res.status(200).json({
      success: true,
      interactions: interactions || [],
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur API chatbot interactions:', error);
    return res.status(500).json({
      error: 'Erreur serveur interne',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}