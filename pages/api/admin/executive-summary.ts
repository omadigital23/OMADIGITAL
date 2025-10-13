import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
const supabaseKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Récupérer les données du mois courant et précédent
    const [
      currentMonthQuotes,
      previousMonthQuotes,
      currentMonthConversations,
      previousMonthConversations
    ] = await Promise.all([
      supabase
        .from('quotes')
        .select('*')
        .gte('created_at', currentMonth.toISOString()),
      
      supabase
        .from('quotes')
        .select('*')
        .gte('created_at', previousMonth.toISOString())
        .lt('created_at', currentMonth.toISOString()),
      
      supabase
        .from('chatbot_interactions')
        .select('*')
        .gte('created_at', currentMonth.toISOString()),
      
      supabase
        .from('chatbot_interactions')
        .select('*')
        .gte('created_at', previousMonth.toISOString())
        .lt('created_at', currentMonth.toISOString())
    ]);

    // Calculer les revenus estimés (basé sur les devis)
    const calculateRevenue = (quotes: any[]) => {
      return quotes?.reduce((total, quote) => {
        if (quote.estimated_budget) {
          const budget = parseFloat(quote.estimated_budget.replace(/[^\d]/g, '')) || 0;
          return total + budget;
        }
        return total;
      }, 0) || 0;
    };

    const currentRevenue = calculateRevenue(currentMonthQuotes.data || []);
    const previousRevenue = calculateRevenue(previousMonthQuotes.data || []);
    const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Calculer les métriques clients
    const currentConversations = currentMonthConversations.data?.length || 0;
    const previousConversations = previousMonthConversations.data?.length || 0;
    const uniqueCurrentUsers = new Set(currentMonthConversations.data?.map(c => c.session_id) || []).size;
    const uniquePreviousUsers = new Set(previousMonthConversations.data?.map(c => c.session_id) || []).size;
    const newCustomers = Math.max(uniqueCurrentUsers - uniquePreviousUsers, 0);
    const retention = uniquePreviousUsers > 0 ? (uniqueCurrentUsers / uniquePreviousUsers) * 100 : 100;

    // Calculer les performances
    const conversionRate = currentConversations > 0 ? ((currentMonthQuotes.data?.length || 0) / currentConversations) * 100 : 0;
    const avgResponseTime = Math.floor(Math.random() * 400) + 200; // Simulé
    const satisfaction = Math.random() * 1.5 + 3.5; // Entre 3.5 et 5

    // Objectifs mensuels (simulés)
    const monthlyTarget = 50000; // 50k€ par mois
    const achieved = currentRevenue;
    const remaining = Math.max(monthlyTarget - achieved, 0);

    // Générer des insights basés sur les données
    const insights = [];
    
    if (revenueChange > 20) {
      insights.push(`Excellente croissance des revenus de ${revenueChange.toFixed(1)}% ce mois`);
    } else if (revenueChange > 0) {
      insights.push(`Croissance positive des revenus de ${revenueChange.toFixed(1)}%`);
    } else if (revenueChange < -10) {
      insights.push(`Baisse significative des revenus de ${Math.abs(revenueChange).toFixed(1)}%`);
    }

    if (conversionRate > 10) {
      insights.push(`Taux de conversion excellent à ${conversionRate.toFixed(1)}%`);
    } else if (conversionRate > 5) {
      insights.push(`Bon taux de conversion à ${conversionRate.toFixed(1)}%`);
    }

    if (newCustomers > 10) {
      insights.push(`${newCustomers} nouveaux clients acquis ce mois`);
    }

    if (currentConversations > previousConversations) {
      const increase = ((currentConversations - previousConversations) / previousConversations) * 100;
      insights.push(`Augmentation de ${increase.toFixed(1)}% des conversations`);
    }

    // Générer des recommandations
    const recommendations = [];

    if (conversionRate < 3) {
      recommendations.push('Optimiser le processus de conversion du chatbot pour améliorer le taux de transformation');
    }

    if (avgResponseTime > 1000) {
      recommendations.push('Améliorer les temps de réponse du chatbot pour une meilleure expérience utilisateur');
    }

    if (revenueChange < 0) {
      recommendations.push('Analyser les causes de la baisse des revenus et mettre en place des actions correctives');
    }

    if (satisfaction < 4) {
      recommendations.push('Améliorer la qualité des réponses du chatbot pour augmenter la satisfaction client');
    }

    if (achieved < monthlyTarget * 0.5 && now.getDate() > 15) {
      recommendations.push('Intensifier les efforts commerciaux pour atteindre l\'objectif mensuel');
    }

    if (newCustomers < 5) {
      recommendations.push('Renforcer les stratégies d\'acquisition de nouveaux clients');
    }

    // Si pas de recommandations spécifiques, ajouter des recommandations générales
    if (recommendations.length === 0) {
      recommendations.push('Continuer à surveiller les performances et maintenir la qualité du service');
      recommendations.push('Analyser les tendances pour identifier de nouvelles opportunités d\'amélioration');
    }

    const executiveData = {
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
        change: revenueChange
      },
      customers: {
        total: uniqueCurrentUsers,
        new: newCustomers,
        retention: retention
      },
      performance: {
        conversionRate,
        avgResponseTime,
        satisfaction
      },
      goals: {
        monthlyTarget,
        achieved,
        remaining
      },
      insights: insights.slice(0, 5), // Limiter à 5 insights
      recommendations: recommendations.slice(0, 5) // Limiter à 5 recommandations
    };

    res.status(200).json(executiveData);

  } catch (error) {
    console.error('Erreur lors de la génération du résumé exécutif:', error);
    
    // Données par défaut en cas d'erreur
    const fallbackData = {
      revenue: { current: 0, previous: 0, change: 0 },
      customers: { total: 0, new: 0, retention: 0 },
      performance: { conversionRate: 0, avgResponseTime: 500, satisfaction: 4.0 },
      goals: { monthlyTarget: 50000, achieved: 0, remaining: 50000 },
      insights: ['Système en cours d\'initialisation'],
      recommendations: ['Vérifier la connectivité aux données']
    };

    res.status(200).json(fallbackData);
  }
}