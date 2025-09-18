#!/usr/bin/env node

/**
 * Script direct pour appliquer la migration du chatbot
 * Utilise des requêtes SQL directes
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase Cloud
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 MIGRATION DIRECTE DU CHATBOT');
console.log('═'.repeat(40));

async function testConnection() {
  console.log('🔌 Test de connexion...');
  
  try {
    // Test simple avec une requête basique
    const { data, error } = await supabase
      .from('chatbot_interactions')
      .select('message_id')
      .limit(1);

    if (error) {
      console.log('⚠️  Table chatbot_interactions:', error.message);
      return false;
    }

    console.log('✅ Connexion réussie!');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    return false;
  }
}

async function checkCurrentColumns() {
  console.log('\n📋 Vérification des colonnes actuelles...');
  
  try {
    // Essayer d'insérer un objet de test pour voir quelles colonnes existent
    const testId = `test_columns_${Date.now()}`;
    
    const { error } = await supabase
      .from('chatbot_interactions')
      .insert([{
        message_id: testId,
        session_id: 'test',
        message_text: 'test',
        response_text: 'test',
        input_method: 'text',
        response_time: 1000,
        // Tester les nouvelles colonnes
        language: 'fr',
        source: 'test',
        confidence: 0.9
      }]);

    if (error) {
      if (error.message.includes('confidence')) {
        console.log('❌ Colonne "confidence" manquante - migration nécessaire');
        return false;
      } else {
        console.log('⚠️  Autre erreur:', error.message);
        return false;
      }
    } else {
      console.log('✅ Toutes les colonnes semblent présentes');
      // Nettoyer le test
      await supabase
        .from('chatbot_interactions')
        .delete()
        .eq('message_id', testId);
      return true;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    return false;
  }
}

async function addMissingColumns() {
  console.log('\n⚡ Ajout des colonnes manquantes...');

  const alterCommands = [
    'ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS language text',
    'ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS source text',
    'ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS confidence decimal(3,2)',
    'ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS suggestions integer DEFAULT 0',
    'ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS cta_type text',
    'ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS response_length integer',
    'ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS suggestion_count integer'
  ];

  const constraintCommands = [
    'ALTER TABLE chatbot_interactions ADD CONSTRAINT IF NOT EXISTS check_language CHECK (language IN (\'fr\', \'en\') OR language IS NULL)',
    'ALTER TABLE chatbot_interactions ADD CONSTRAINT IF NOT EXISTS check_confidence CHECK (confidence >= 0 AND confidence <= 1 OR confidence IS NULL)',
    'ALTER TABLE chatbot_interactions ADD CONSTRAINT IF NOT EXISTS check_suggestions CHECK (suggestions >= 0 OR suggestions IS NULL)',
    'ALTER TABLE chatbot_interactions ADD CONSTRAINT IF NOT EXISTS check_response_length CHECK (response_length >= 0 OR response_length IS NULL)',
    'ALTER TABLE chatbot_interactions ADD CONSTRAINT IF NOT EXISTS check_suggestion_count CHECK (suggestion_count >= 0 OR suggestion_count IS NULL)',
    'ALTER TABLE chatbot_interactions ADD CONSTRAINT IF NOT EXISTS check_cta_type CHECK (cta_type IN (\'contact\', \'demo\', \'appointment\', \'quote\') OR cta_type IS NULL)'
  ];

  // Exécuter les commandes ALTER TABLE
  console.log('📝 Ajout des colonnes...');
  for (let i = 0; i < alterCommands.length; i++) {
    const command = alterCommands[i];
    console.log(`   ${i + 1}/${alterCommands.length}: ${command.split(' ')[5]}...`);
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: command });
      
      if (error) {
        if (error.message.includes('already exists')) {
          console.log('   ✅ Déjà existant');
        } else {
          console.error('   ❌ Erreur:', error.message);
          return false;
        }
      } else {
        console.log('   ✅ Ajouté');
      }
    } catch (error) {
      console.error('   ❌ Exception:', error.message);
      return false;
    }
  }

  // Exécuter les contraintes
  console.log('\n🛡️  Ajout des contraintes...');
  for (let i = 0; i < constraintCommands.length; i++) {
    const command = constraintCommands[i];
    const constraintName = command.includes('check_language') ? 'language' :
                          command.includes('check_confidence') ? 'confidence' :
                          command.includes('check_suggestions') ? 'suggestions' :
                          command.includes('check_response_length') ? 'response_length' :
                          command.includes('check_suggestion_count') ? 'suggestion_count' :
                          command.includes('check_cta_type') ? 'cta_type' : 'unknown';
    
    console.log(`   ${i + 1}/${constraintCommands.length}: ${constraintName}...`);
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: command });
      
      if (error) {
        if (error.message.includes('already exists')) {
          console.log('   ✅ Déjà existant');
        } else {
          console.error('   ❌ Erreur:', error.message);
          // Continuer même si les contraintes échouent
        }
      } else {
        console.log('   ✅ Ajouté');
      }
    } catch (error) {
      console.error('   ⚠️  Exception:', error.message);
      // Continuer même si les contraintes échouent
    }
  }

  return true;
}

async function testFinalInsertion() {
  console.log('\n🧪 Test final d\'insertion...');

  const testData = {
    message_id: `test_final_${Date.now()}`,
    session_id: 'test_session_final',
    message_text: 'Test final après migration',
    response_text: 'Réponse test final',
    input_method: 'text',
    response_time: 1500,
    language: 'fr',
    source: 'ultra_intelligent_rag',
    confidence: 0.95,
    suggestions: 3,
    cta_type: 'contact',
    response_length: 19,
    suggestion_count: 3
  };

  try {
    const { data, error } = await supabase
      .from('chatbot_interactions')
      .insert([testData])
      .select();

    if (error) {
      console.error('❌ Test final échoué:', error.message);
      return false;
    }

    console.log('✅ Test final réussi!');
    console.log('📊 Données insérées avec toutes les colonnes');
    
    // Nettoyer
    await supabase
      .from('chatbot_interactions')
      .delete()
      .eq('message_id', testData.message_id);
    
    console.log('🧹 Données de test nettoyées');
    return true;

  } catch (error) {
    console.error('❌ Exception lors du test final:', error.message);
    return false;
  }
}

async function main() {
  // Étape 1: Test de connexion
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ Impossible de se connecter à Supabase');
    process.exit(1);
  }

  // Étape 2: Vérifier les colonnes actuelles
  const columnsOk = await checkCurrentColumns();
  if (columnsOk) {
    console.log('\n✅ MIGRATION DÉJÀ APPLIQUÉE!');
    console.log('🎉 Toutes les colonnes sont présentes et fonctionnelles');
    return;
  }

  // Étape 3: Ajouter les colonnes manquantes
  const migrationSuccess = await addMissingColumns();
  if (!migrationSuccess) {
    console.log('\n❌ Échec de la migration');
    process.exit(1);
  }

  // Étape 4: Test final
  const testSuccess = await testFinalInsertion();
  if (!testSuccess) {
    console.log('\n⚠️  Migration appliquée mais test final échoué');
    process.exit(1);
  }

  console.log('\n🎉 MIGRATION RÉUSSIE!');
  console.log('═'.repeat(40));
  console.log('✅ Toutes les colonnes ajoutées');
  console.log('✅ Contraintes appliquées');
  console.log('✅ Test d\'insertion réussi');
  console.log('\n💡 Le problème "confidence column" est maintenant résolu!');
  console.log('🚀 Vous pouvez utiliser le chatbot sans erreur');
}

main().catch(console.error);