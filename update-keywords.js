/**
 * Script pour mettre à jour les mots-clés RAG dans Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables manquantes: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateKeywords() {
  console.log('🚀 Mise à jour des mots-clés RAG...\n');

  const sql = fs.readFileSync('supabase/migrations/update_keywords_comprehensive.sql', 'utf8');
  
  // Séparer les requêtes SQL
  const queries = sql
    .split(';')
    .map(q => q.trim())
    .filter(q => q && !q.startsWith('--') && q.length > 10);

  console.log(`📝 ${queries.length} requêtes à exécuter\n`);

  let success = 0;
  let errors = 0;

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    
    try {
      // Exécuter directement via Supabase
      const { error } = await supabase.rpc('exec_sql', { query: query + ';' });
      
      if (error) {
        // Si exec_sql n'existe pas, utiliser une approche différente
        console.log(`⚠️  Requête ${i + 1}: Utilisation méthode alternative`);
        // Extraire les infos de la requête UPDATE
        const match = query.match(/UPDATE\s+(\w+)\s+SET\s+keywords\s*=\s*ARRAY\[(.*?)\]\s+WHERE\s+(.*)/is);
        if (match) {
          const [, table, keywordsStr, whereClause] = match;
          // Cette approche ne fonctionnera pas directement, on doit passer par l'API REST
          console.log(`   Table: ${table}, Where: ${whereClause.substring(0, 50)}...`);
        }
        errors++;
      } else {
        console.log(`✅ Requête ${i + 1}/${queries.length} exécutée`);
        success++;
      }
    } catch (err) {
      console.error(`❌ Erreur requête ${i + 1}:`, err.message);
      errors++;
    }
  }

  console.log(`\n🎉 Terminé!`);
  console.log(`   ✅ Succès: ${success}`);
  console.log(`   ❌ Erreurs: ${errors}`);
}

updateKeywords().catch(console.error);
