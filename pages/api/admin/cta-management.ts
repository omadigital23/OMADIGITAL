/**
 * API Route pour la gestion des CTAs
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { ctaService } from '../../../src/lib/cta-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('CTA API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { language, analytics, metrics, ctaId } = req.query;

  // Récupérer les métriques d'un CTA spécifique
  if (metrics && ctaId) {
    const ctaMetrics = await ctaService.getCTAMetrics(ctaId as string);
    return res.status(200).json(ctaMetrics);
  }

  // Récupérer les analytics
  if (analytics) {
    const { dateFrom, dateTo } = req.query;
    const analyticsData = await ctaService.getCTAAnalytics(
      dateFrom as string,
      dateTo as string
    );
    return res.status(200).json(analyticsData);
  }

  // Récupérer les CTAs actifs
  const ctas = await ctaService.getActiveCTAs(language as 'fr' | 'en');
  return res.status(200).json(ctas);
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { action, ctaData, sessionId, actionType, metadata } = req.body;

  // Tracker une action CTA
  if (action === 'track') {
    const { ctaId, sessionId, actionType, metadata } = req.body;
    await ctaService.trackCTAAction(ctaId, sessionId, actionType, metadata);
    return res.status(200).json({ success: true });
  }

  // Enregistrer une conversion
  if (action === 'conversion') {
    const { ctaId, sessionId, conversionType, value, metadata } = req.body;
    await ctaService.recordCTAConversion(ctaId, sessionId, conversionType, value, metadata);
    return res.status(200).json({ success: true });
  }

  // Créer un nouveau CTA
  const newCTA = await ctaService.upsertCTA(ctaData);
  return res.status(201).json(newCTA);
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { ctaData } = req.body;
  const updatedCTA = await ctaService.upsertCTA(ctaData);
  return res.status(200).json(updatedCTA);
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { ctaId } = req.query;
  
  if (!ctaId) {
    return res.status(400).json({ error: 'CTA ID required' });
  }

  const success = await ctaService.deleteCTA(ctaId as string);
  
  if (success) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(500).json({ error: 'Failed to delete CTA' });
  }
}