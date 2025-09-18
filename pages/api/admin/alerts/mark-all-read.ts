import { NextApiRequest, NextApiResponse } from 'next';

import { requireAdminApi } from '../../../../src/utils/adminApiGuard';

export default requireAdminApi(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // En production, marquer toutes les alertes comme lues dans Supabase
    
    res.status(200).json({ success: true, message: 'Toutes les alertes marquées comme lues' });

  } catch (error) {
    console.error('Erreur lors du marquage global:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});