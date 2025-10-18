/**
 * Script de vérification de la base de connaissances Supabase
 * Vérifie que toutes les données sont bien chargées
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function verifyKnowledgeBase() {
  console.log('🔍 Vérification de la base de connaissances...\n');

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Vérifier la table existe
  const { data: allData, error: allError } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('is_active', true);

  if (allError) {
    console.error('❌ Erreur accès table knowledge_base:', allError.message);
    console.log('\n⚠️  ACTION REQUISE: Exécutez les migrations Supabase:');
    console.log('   1. Allez dans Supabase Dashboard → SQL Editor');
    console.log('   2. Exécutez: supabase/migration_script.sql');
    console.log('   3. Puis: supabase/migrations/20250903000001_chatbot_knowledge_base_data.sql\n');
    return;
  }

  console.log(`✅ Table knowledge_base accessible`);
  console.log(`📊 Total documents: ${allData?.length || 0}\n`);

  // 2. Vérifier par langue
  const { data: frData } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('language', 'fr')
    .eq('is_active', true);

  const { data: enData } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('language', 'en')
    .eq('is_active', true);

  console.log(`🇫🇷 Documents français: ${frData?.length || 0}`);
  console.log(`🇬🇧 Documents anglais: ${enData?.length || 0}\n`);

  // 3. Vérifier par catégorie
  const categories = ['contact', 'services', 'pricing', 'faq', 'use_cases', 'technical'];
  
  console.log('📂 Documents par catégorie:');
  for (const category of categories) {
    const { data: catData } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('category', category)
      .eq('is_active', true);
    
    console.log(`   ${category.padEnd(15)}: ${catData?.length || 0} documents`);
  }

  // 4. Vérifier informations de contact spécifiquement
  console.log('\n📞 Vérification informations de contact:');
  const { data: contactData } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('category', 'contact')
    .eq('is_active', true);

  if (contactData && contactData.length > 0) {
    contactData.forEach((doc: any) => {
      console.log(`   ✅ ${doc.language.toUpperCase()}: ${doc.title}`);
      const hasPhone = doc.content.includes('+212 701 193 811');
      const hasEmail = doc.content.includes('omadigital23@gmail.com');
      console.log(`      Téléphone: ${hasPhone ? '✅' : '❌'} +212 701 193 811`);
      console.log(`      Email: ${hasEmail ? '✅' : '❌'} omadigital23@gmail.com`);
    });
  } else {
    console.log('   ❌ AUCUNE information de contact trouvée!');
    console.log('   ⚠️  Exécutez: supabase/migrations/20250903000001_chatbot_knowledge_base_data.sql');
  }

  // 5. Test de recherche
  console.log('\n🔍 Test de recherche RAG:');
  const testQueries = [
    { query: 'téléphone', expected: 'contact' },
    { query: 'prix', expected: 'pricing' },
    { query: 'whatsapp', expected: 'services' }
  ];

  for (const test of testQueries) {
    const { data: searchData } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('language', 'fr')
      .textSearch('content', test.query)
      .limit(1);

    const found = searchData && searchData.length > 0;
    console.log(`   "${test.query}": ${found ? '✅' : '❌'} ${found ? searchData[0].category : 'non trouvé'}`);
  }

  console.log('\n✅ Vérification terminée!\n');
}

verifyKnowledgeBase().catch(console.error);
