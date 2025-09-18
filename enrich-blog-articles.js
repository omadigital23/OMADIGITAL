/**
 * Script pour enrichir automatiquement tous les articles de blog
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function enrichAllBlogArticles() {
  console.log('🚀 Démarrage de l\'enrichissement des articles de blog...\n');

  try {
    // Récupérer tous les articles courts ou vides
    const { data: articles, error } = await supabase
      .from('blog_articles')
      .select('*')
      .or('content.is.null,content.eq.,char_length(content).lt.500');

    if (error) {
      throw new Error(`Erreur Supabase: ${error.message}`);
    }

    if (!articles || articles.length === 0) {
      console.log('✅ Aucun article à enrichir trouvé.');
      return;
    }

    console.log(`📝 ${articles.length} articles à enrichir trouvés.\n`);

    let enriched = 0;
    let errors = 0;

    for (const article of articles) {
      try {
        console.log(`📖 Enrichissement: "${article.title}"...`);
        
        const enrichedContent = await generateFullArticle(article);
        
        const { error: updateError } = await supabase
          .from('blog_articles')
          .update({
            content: enrichedContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', article.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`✅ Article enrichi: ${enrichedContent.length} caractères`);
        enriched++;
        
        // Pause pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (err) {
        console.error(`❌ Erreur pour "${article.title}":`, err.message);
        errors++;
      }
    }

    console.log(`\n🎯 Résultats:`);
    console.log(`✅ Articles enrichis: ${enriched}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📊 Taux de succès: ${((enriched / articles.length) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Erreur critique:', error.message);
    process.exit(1);
  }
}

async function generateFullArticle(article) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY manquante dans .env.local');
  }

  const prompt = `Tu es un expert en rédaction d'articles de blog pour OMA Digital, une agence digitale sénégalaise spécialisée dans l'automatisation WhatsApp, les sites web ultra-rapides, et les solutions IA pour PME.

ARTICLE À ENRICHIR:
Titre: ${article.title}
Contenu actuel: ${article.content || 'Aucun contenu'}
Catégorie: ${article.category || 'général'}

INSTRUCTIONS:
1. Rédige un article complet de 1500-2000 mots
2. Structure avec des titres H2 et H3 en markdown
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

Rédige l'article complet en français avec une structure markdown claire:`;

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
    throw new Error(`Gemini API error: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  const generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!generatedContent) {
    throw new Error('Aucun contenu généré par Gemini');
  }

  return generatedContent;
}

// Exécution si appelé directement
if (require.main === module) {
  enrichAllBlogArticles();
}

module.exports = { enrichAllBlogArticles };