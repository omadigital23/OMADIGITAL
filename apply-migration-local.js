#!/usr/bin/env node

/**
 * Script pour appliquer la migration en utilisant la configuration locale Supabase
 * Fonctionne avec l'instance locale de Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration pour l'instance locale Supabase
const LOCAL_SUPABASE_URL = 'http://127.0.0.1:54321';
const LOCAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const LOCAL_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🔧 APPLICATION DE LA MIGRATION CHATBOT (LOCAL)');
console.log('═'.repeat(50));

// Utiliser directement les variables d'environnement du fichier .env.local
let supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
let supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

console.log('☁️  Utilisation de l\'instance cloud Supabase');
console.log('📍 URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  console.log('\n🔌 Test de connexion...');
  
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1);

    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      return false;
    }

    console.log('✅ Connexion réussie!');
    return true;
  } catch (error) {
    console.error('❌ Impossible de se connecter:', error.message);
    return false;
  }
}

async function checkTableExists() {
  console.log('\n🔍 Vérification de la table chatbot_interactions...');
  
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'chatbot_interactions');

    if (error) {
      console.error('❌ Erreur lors de la vérification:', error.message);
      return false;
    }

    if (data && data.length > 0) {
      console.log('✅ Table chatbot_interactions trouvée');
      return true;
    } else {
      console.log('❌ Table chatbot_interactions non trouvée');
      console.log('💡 Vous devez d\'abord créer la table de base avec:');
      console.log('   supabase db reset');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

async function getCurrentColumns() {
  console.log('\n📋 Colonnes actuelles de la table...');
  
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'chatbot_interactions')
      .order('ordinal_position');

    if (error) {
      console.error('❌ Erreur:', error.message);
      return [];
    }

    console.log('─'.repeat(50));
    data.forEach(col => {
      console.log(`   ${col.column_name} (${col.data_type})`);
    });
    console.log('─'.repeat(50));

    return data.map(col => col.column_name);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return [];
  }
}

async function applyMigration() {
  console.log('\n⚡ Application de la migration...');

  // Lire le fichier de migration
  const migrationPath = path.join(__dirname, 'supabase/migrations/20250120000000_add_missing_chatbot_columns.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Fichier de migration non trouvé:', migrationPath);
    return false;
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  try {
    // Diviser le SQL en commandes individuelles
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 Exécution de ${commands.length} commandes SQL...`);

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        console.log(`   ${i + 1}/${commands.length}: ${command.substring(0, 50)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql: command + ';' 
        });

        if (error) {
          // Ignorer les erreurs "already exists" qui sont normales
          if (error.message.includes('already exists') || 
              error.message.includes('IF NOT EXISTS')) {
            console.log(`   ⚠️  Déjà existant (ignoré)`);
          } else {
            console.error(`   ❌ Erreur:`, error.message);
            return false;
          }
        } else {
          console.log(`   ✅ Réussi`);
        }
      }
    }

    console.log('✅ Migration appliquée avec succès!');
    return true;

  } catch (error) {
    console.error('❌ Erreur lors de l\'application:', error.message);
    return false;
  }
}

async function testInsertion() {
  console.log('\n🧪 Test d\'insertion...');

  const testData = {
    message_id: `test_local_${Date.now()}`,
    session_id: 'test_session_local',
    message_text: 'Test local',
    response_text: 'Réponse test local',
    input_method: 'text',
    response_time: 1000,
    language: 'fr',
    source: 'test',
    confidence: 0.9,
    suggestions: 2,
    cta_type: 'contact',
    response_length: 18,
    suggestion_count: 2
  };

  try {
    const { data, error } = await supabase
      .from('chatbot_interactions')
      .insert([testData])
      .select();

    if (error) {
      console.error('❌ Test d\'insertion échoué:', error.message);
      return false;
    }

    console.log('✅ Test d\'insertion réussi!');
    
    // Nettoyer
    await supabase
      .from('chatbot_interactions')
      .delete()
      .eq('message_id', testData.message_id);
    
    console.log('🧹 Données de test nettoyées');
    return true;

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    return false;
  }
}

async function main() {
  // Étape 1: Vérifier la connexion
  const connected = await checkConnection();
  if (!connected) {
    console.log('\n💡 Solutions possibles:');
    console.log('   1. Démarrer Supabase local: supabase start');
    console.log('   2. Configurer les variables d\'environnement cloud');
    process.exit(1);
  }

  // Étape 2: Vérifier que la table existe
  const tableExists = await checkTableExists();
  if (!tableExists) {
    process.exit(1);
  }

  // Étape 3: Voir les colonnes actuelles
  const currentColumns = await getCurrentColumns();
  
  // Vérifier si les colonnes manquantes existent déjà
  const requiredColumns = ['language', 'source', 'confidence', 'suggestions', 'cta_type', 'response_length', 'suggestion_count'];
  const missingColumns = requiredColumns.filter(col => !currentColumns.includes(col));
  
  if (missingColumns.length === 0) {
    console.log('\n✅ Toutes les colonnes sont déjà présentes!');
    console.log('🧪 Test d\'insertion pour vérifier...');
    const testPassed = await testInsertion();
    if (testPassed) {
      console.log('\n🎉 MIGRATION DÉJÀ APPLIQUÉE ET FONCTIONNELLE!');
    }
    return;
  }

  console.log(`\n📝 Colonnes manquantes: ${missingColumns.join(', ')}`);

  // Étape 4: Appliquer la migration
  const migrationSuccess = await applyMigration();
  if (!migrationSuccess) {
    process.exit(1);
  }

  // Étape 5: Tester l'insertion
  const testSuccess = await testInsertion();
  if (!testSuccess) {
    console.log('⚠️  Migration appliquée mais test d\'insertion échoué');
    process.exit(1);
  }

  console.log('\n🎉 MIGRATION TERMINÉE AVEC SUCCÈS!');
  console.log('═'.repeat(50));
  console.log('✅ Toutes les colonnes ajoutées');
  console.log('✅ Test d\'insertion réussi');
  console.log('💡 Le problème du chatbot devrait être résolu!');
}

main().catch(console.error);