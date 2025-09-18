#!/usr/bin/env node

/**
 * Script complet pour corriger le problème du chatbot
 * Applique la migration et vérifie que tout fonctionne
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 CORRECTION COMPLÈTE DU CHATBOT');
console.log('═'.repeat(50));

// Vérifier que les fichiers existent
const requiredFiles = [
  'supabase/migrations/20250120000000_add_missing_chatbot_columns.sql',
  'apply-chatbot-columns-migration.js',
  'test-chatbot-fix.js'
];

console.log('📋 Vérification des fichiers requis...');
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Fichier manquant: ${file}`);
    process.exit(1);
  }
  console.log(`✅ ${file}`);
}

try {
  console.log('\n🔧 ÉTAPE 1: Application de la migration');
  console.log('─'.repeat(30));
  execSync('node apply-chatbot-columns-migration.js', { stdio: 'inherit' });

  console.log('\n🧪 ÉTAPE 2: Tests de validation');
  console.log('─'.repeat(30));
  execSync('node test-chatbot-fix.js', { stdio: 'inherit' });

  console.log('\n🎉 CORRECTION TERMINÉE AVEC SUCCÈS!');
  console.log('═'.repeat(50));
  console.log('✅ Migration appliquée');
  console.log('✅ Tests validés');
  console.log('✅ Problème "confidence column" résolu');
  console.log('\n💡 Vous pouvez maintenant utiliser le chatbot sans erreur.');

} catch (error) {
  console.error('\n❌ ERREUR LORS DE LA CORRECTION');
  console.error('═'.repeat(50));
  console.error('Détails:', error.message);
  console.error('\n🔍 Vérifiez:');
  console.error('   - Les variables d\'environnement Supabase');
  console.error('   - La connexion à la base de données');
  console.error('   - Les permissions sur les tables');
  process.exit(1);
}