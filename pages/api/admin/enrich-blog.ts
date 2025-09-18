/**
 * API pour enrichir les articles de blog avec IA
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

import { requireAdminApi } from '../../../src/utils/adminApiGuard';

export default requireAdminApi(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { articleId, action } = req.body;

    if (action === 'enrich-all') {
      return await enrichAllArticles(res);
    }

    if (action === 'enrich-single' && articleId) {
      return await enrichSingleArticle(articleId, res);
    }

    return res.status(400).json({ error: 'Action ou articleId manquant' });

  } catch (error) {
    console.error('Erreur enrichissement blog:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

async function enrichAllArticles(res: NextApiResponse) {
  // Récupérer tous les articles courts
  const { data: articles, error } = await supabase
    .from('blog_articles')
    .select('*')
    .or('content.is.null,content.eq.')
    .or('char_length(content).lt.500');

  if (error) throw error;

  const results = [];
  
  for (const article of articles || []) {
    try {
      const enrichedContent = await generateFullArticle(article);
      
      const { error: updateError } = await supabase
        .from('blog_articles')
        .update({
          content: enrichedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', article.id);

      if (!updateError) {
        results.push({ id: article.id, title: article.title, status: 'enriched' });
      }
    } catch (err) {
      results.push({ id: article.id, title: article.title, status: 'error', error: err.message });
    }
  }

  return res.status(200).json({
    message: `${results.filter(r => r.status === 'enriched').length} articles enrichis`,
    results
  });
}

async function enrichSingleArticle(articleId: string, res: NextApiResponse) {
  const { data: article, error } = await supabase
    .from('blog_articles')
    .select('*')
    .eq('id', articleId)
    .single();

  if (error) throw error;

  const enrichedContent = await generateFullArticle(article);
  
  const { error: updateError } = await supabase
    .from('blog_articles')
    .update({
      content: enrichedContent,
      updated_at: new Date().toISOString()
    })
    .eq('id', articleId);

  if (updateError) throw updateError;

  return res.status(200).json({
    message: 'Article enrichi avec succès',
    article: { ...article, content: enrichedContent }
  });
}

async function generateFullArticle(article: any): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY manquante');
  }

  const prompt = `Tu es un expert en rédaction d'articles de blog pour OMA Digital, une agence digitale sénégalaise spécialisée dans l'automatisation WhatsApp, les sites web ultra-rapides, et les solutions IA pour PME.

ARTICLE À ENRICHIR:
Titre: ${article.title}
Contenu actuel: ${article.content || 'Aucun contenu'}
Catégorie: ${article.category || 'général'}

INSTRUCTIONS:
1. Rédige un article complet de 1500-2000 mots
2. Structure avec des titres H2 et H3
3. Inclus des exemples concrets pour PME sénégalaises
4. Ajoute des statistiques et données pertinentes
5. Termine par un appel à l'action vers OMA Digital
6. Utilise un ton professionnel mais accessible
7. Optimise pour le SEO avec mots-clés naturels

SERVICES OMA DIGITAL À MENTIONNER:
- Automatisation WhatsApp Business (50k CFA/mois)
- Sites web ultra-rapides (150k+ CFA)
- Applications mobiles iOS/Android
- Assistants IA personnalisés (75k+ CFA/mois)
- Branding digital authentique (200k+ CFA)

Contact: +212 701 193 811 | omasenegal25@gmail.com

Rédige l'article complet en français:`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000,
        topP: 0.8,
        topK: 40
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || article.content;
}