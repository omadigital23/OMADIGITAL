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

    // En production, sauvegarder l'état dans Supabase
    // Pour l'instant, on simule juste le succès
    
    res.status(200).json({ success: true, message: 'Alerte marquée comme lue' });

  } catch (error) {
    console.error('Erreur lors du marquage comme lu:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});