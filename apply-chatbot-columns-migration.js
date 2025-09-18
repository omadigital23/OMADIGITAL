#!/usr/bin/env node

/**
 * Script pour appliquer la migration des colonnes manquantes du chatbot
 * et vérifier que le problème est résolu
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration() {
  console.log('🚀 Application de la migration des colonnes chatbot...\n');

  try {
    // Lire le fichier de migration
    const migrationPath = path.join(__dirname, 'supabase/migrations/20250120000000_add_missing_chatbot_columns.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Contenu de la migration:');
    console.log('─'.repeat(50));
    console.log(migrationSQL);
    console.log('─'.repeat(50));

    // Exécuter la migration
    console.log('\n⚡ Exécution de la migration...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error('❌ Erreur lors de l\'exécution de la migration:', error);
      return false;
    }

    console.log('✅ Migration appliquée avec succès!');
    return true;

  } catch (error) {
    console.error('❌ Erreur lors de la lecture/exécution de la migration:', error);
    return false;
  }
}

async function verifySchema() {
  console.log('\n🔍 Vérification du schéma de la table chatbot_interactions...');

  try {
    // Vérifier la structure de la table
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'chatbot_interactions')
      .order('ordinal_position');

    if (error) {
      console.error('❌ Erreur lors de la vérification du schéma:', error);
      return false;
    }

    console.log('\n📋 Structure actuelle de la table:');
    console.log('─'.repeat(60));
    console.log('| Colonne              | Type        | Nullable |');
    console.log('─'.repeat(60));
    
    data.forEach(col => {
      const name = col.column_name.padEnd(20);
      const type = col.data_type.padEnd(11);
      const nullable = col.is_nullable === 'YES' ? 'Oui' : 'Non';
      console.log(`| ${name} | ${type} | ${nullable.padEnd(8)} |`);
    });
    console.log('─'.repeat(60));

    // Vérifier que les nouvelles colonnes sont présentes
    const requiredColumns = ['language', 'source', 'confidence', 'suggestions', 'cta_type', 'response_length', 'suggestion_count'];
    const existingColumns = data.map(col => col.column_name);
    
    console.log('\n🔎 Vérification des colonnes requises:');
    let allPresent = true;
    
    requiredColumns.forEach(col => {
      const present = existingColumns.includes(col);
      console.log(`   ${present ? '✅' : '❌'} ${col}`);
      if (!present) allPresent = false;
    });

    return allPresent;

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    return false;
  }
}

async function testInsertion() {
  console.log('\n🧪 Test d\'insertion avec les nouvelles colonnes...');

  try {
    const testData = {
      message_id: `test_${Date.now()}`,
      session_id: 'test_session',
      message_text: 'Test message',
      response_text: 'Test response',
      input_method: 'text',
      response_time: 1500,
      timestamp: new Date().toISOString(),
      language: 'fr',
      source: 'ultra_intelligent_rag',
      confidence: 0.95,
      suggestions: 3,
      cta_type: 'contact',
      response_length: 13,
      suggestion_count: 3
    };

    const { data, error } = await supabase
      .from('chatbot_interactions')
      .insert([testData])
      .select();

    if (error) {
      console.error('❌ Erreur lors du test d\'insertion:', error);
      return false;
    }

    console.log('✅ Test d\'insertion réussi!');
    console.log('📊 Données insérées:', data[0]);

    // Nettoyer le test
    await supabase
      .from('chatbot_interactions')
      .delete()
      .eq('message_id', testData.message_id);

    console.log('🧹 Données de test nettoyées');
    return true;

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    return false;
  }
}

async function main() {
  console.log('🔧 MIGRATION DES COLONNES CHATBOT');
  console.log('═'.repeat(50));

  // Étape 1: Appliquer la migration
  const migrationSuccess = await applyMigration();
  if (!migrationSuccess) {
    console.log('\n❌ Échec de la migration. Arrêt du processus.');
    process.exit(1);
  }

  // Étape 2: Vérifier le schéma
  const schemaValid = await verifySchema();
  if (!schemaValid) {
    console.log('\n❌ Schéma invalide après migration. Vérification manuelle requise.');
    process.exit(1);
  }

  // Étape 3: Tester l'insertion
  const testSuccess = await testInsertion();
  if (!testSuccess) {
    console.log('\n❌ Test d\'insertion échoué. Vérification manuelle requise.');
    process.exit(1);
  }

  console.log('\n🎉 MIGRATION TERMINÉE AVEC SUCCÈS!');
  console.log('═'.repeat(50));
  console.log('✅ Toutes les colonnes ont été ajoutées');
  console.log('✅ Le schéma est valide');
  console.log('✅ Les insertions fonctionnent correctement');
  console.log('\n💡 Le problème "Could not find the \'confidence\' column" devrait maintenant être résolu.');
}

// Exécuter le script
main().catch(console.error);