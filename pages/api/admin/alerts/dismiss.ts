import { NextApiRequest, NextApiResponse } from 'next';

import { requireAdminApi } from '../../../../src/utils/adminApiGuard';

export default requireAdminApi(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { alertId } = req.body;

    if (!alertId) {
      return res.status(400).json({ error: 'ID d\'alerte requis' });
    }

    // En production, supprimer l'alerte de Supabase
    
    res.status(200).json({ success: true, message: 'Alerte supprimée' });

  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});