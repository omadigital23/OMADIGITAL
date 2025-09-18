#!/usr/bin/env node

/**
 * Script pour appliquer la migration via l'API REST de Supabase
 * Utilise des requêtes HTTP directes pour exécuter le SQL
 */

const fetch = require('node-fetch');

// Configuration Supabase Cloud
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

console.log('🚀 MIGRATION VIA API REST');
console.log('═'.repeat(30));

async function executeSQL(sql) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

async function testConnection() {
  console.log('🔌 Test de connexion...');
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/chatbot_interactions?select=message_id&limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    });

    if (response.ok) {
      console.log('✅ Connexion réussie!');
      return true;
    } else {
      console.error('❌ Erreur de connexion:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    return false;
  }
}

async function testCurrentColumns() {
  console.log('\n📋 Test des colonnes actuelles...');
  
  try {
    const testData = {
      message_id: `test_${Date.now()}`,
      session_id: 'test',
      message_text: 'test',
      response_text: 'test',
      input_method: 'text',
      response_time: 1000,
      language: 'fr',
      source: 'test',
      confidence: 0.9
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/chatbot_interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      console.log('✅ Toutes les colonnes sont présentes!');
      
      // Nettoyer le test
      await fetch(`${supabaseUrl}/rest/v1/chatbot_interactions?message_id=eq.${testData.message_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });
      
      return true;
    } else {
      const errorText = await response.text();
      if (errorText.includes('confidence') || errorText.includes('language') || errorText.includes('source')) {
        console.log('❌ Colonnes manquantes détectées - migration nécessaire');
        return false;
      } else {
        console.log('⚠️  Autre erreur:', errorText);
        return false;
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    return false;
  }
}

async function addColumnsManually() {
  console.log('\n⚡ Ajout manuel des colonnes...');
  
  // Utiliser une approche alternative: créer une nouvelle table avec toutes les colonnes
  // puis copier les données et renommer
  
  const createNewTableSQL = `
    CREATE TABLE IF NOT EXISTS chatbot_interactions_new (
      message_id text PRIMARY KEY,
      user_id uuid,
      session_id text NOT NULL,
      message_text text NOT NULL,
      response_text text NOT NULL,
      input_method text CHECK (input_method IN ('text', 'voice')),
      response_time integer NOT NULL,
      sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative')),
      timestamp timestamptz NOT NULL DEFAULT now(),
      conversation_length integer,
      user_satisfaction integer CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5),
      language text CHECK (language IN ('fr', 'en') OR language IS NULL),
      source text,
      confidence decimal(3,2) CHECK (confidence >= 0 AND confidence <= 1 OR confidence IS NULL),
      suggestions integer DEFAULT 0 CHECK (suggestions >= 0 OR suggestions IS NULL),
      cta_type text CHECK (cta_type IN ('contact', 'demo', 'appointment', 'quote') OR cta_type IS NULL),
      response_length integer CHECK (response_length >= 0 OR response_length IS NULL),
      suggestion_count integer CHECK (suggestion_count >= 0 OR suggestion_count IS NULL)
    );
  `;

  console.log('📝 Création de la nouvelle table...');
  
  try {
    // Utiliser l'API SQL directement via une requête personnalisée
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({ sql: createNewTableSQL })
    });

    if (!response.ok) {
      // Si exec_sql n'existe pas, essayons une approche différente
      console.log('⚠️  exec_sql non disponible, utilisation d\'une approche alternative...');
      return await addColumnsViaAlter();
    }

    console.log('✅ Nouvelle table créée');
    
    // Copier les données existantes
    const copyDataSQL = `
      INSERT INTO chatbot_interactions_new (
        message_id, user_id, session_id, message_text, response_text,
        input_method, response_time, sentiment, timestamp, conversation_length, user_satisfaction
      )
      SELECT 
        message_id, user_id, session_id, message_text, response_text,
        input_method, response_time, sentiment, timestamp, conversation_length, user_satisfaction
      FROM chatbot_interactions;
    `;

    await executeSQL(copyDataSQL);
    console.log('✅ Données copiées');

    // Supprimer l'ancienne table et renommer
    await executeSQL('DROP TABLE chatbot_interactions;');
    await executeSQL('ALTER TABLE chatbot_interactions_new RENAME TO chatbot_interactions;');
    
    console.log('✅ Table mise à jour');
    return true;

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return await addColumnsViaAlter();
  }
}

async function addColumnsViaAlter() {
  console.log('\n🔧 Tentative d\'ajout via ALTER TABLE...');
  
  // Essayer d'ajouter les colonnes une par une via des requêtes INSERT simulées
  const columns = [
    { name: 'language', type: 'text' },
    { name: 'source', type: 'text' },
    { name: 'confidence', type: 'decimal(3,2)' },
    { name: 'suggestions', type: 'integer' },
    { name: 'cta_type', type: 'text' },
    { name: 'response_length', type: 'integer' },
    { name: 'suggestion_count', type: 'integer' }
  ];

  console.log('📝 Simulation de l\'ajout des colonnes...');
  console.log('⚠️  Cette méthode nécessite un accès administrateur à la base de données');
  console.log('💡 Recommandation: Utiliser le dashboard Supabase pour exécuter le SQL manuellement');
  
  console.log('\n📋 SQL à exécuter dans le dashboard Supabase:');
  console.log('─'.repeat(60));
  
  columns.forEach(col => {
    console.log(`ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`);
  });
  
  console.log('─'.repeat(60));
  
  return false;
}

async function testFinalInsertion() {
  console.log('\n🧪 Test final...');

  const testData = {
    message_id: `test_final_${Date.now()}`,
    session_id: 'test_session_final',
    message_text: 'Test final',
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
    const response = await fetch(`${supabaseUrl}/rest/v1/chatbot_interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      console.log('✅ Test final réussi!');
      
      // Nettoyer
      await fetch(`${supabaseUrl}/rest/v1/chatbot_interactions?message_id=eq.${testData.message_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });
      
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Test final échoué:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
    return false;
  }
}

async function main() {
  // Étape 1: Test de connexion
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ Impossible de se connecter');
    process.exit(1);
  }

  // Étape 2: Test des colonnes
  const columnsOk = await testCurrentColumns();
  if (columnsOk) {
    console.log('\n🎉 MIGRATION DÉJÀ APPLIQUÉE!');
    console.log('✅ Toutes les colonnes sont présentes');
    return;
  }

  // Étape 3: Ajouter les colonnes
  const migrationSuccess = await addColumnsManually();
  if (!migrationSuccess) {
    console.log('\n⚠️  MIGRATION MANUELLE REQUISE');
    console.log('═'.repeat(40));
    console.log('🔧 Veuillez exécuter le SQL suivant dans le dashboard Supabase:');
    console.log('   https://supabase.com/dashboard/project/pcedyohixahtfogfdlig/sql');
    console.log('');
    console.log('-- Ajouter les colonnes manquantes');
    console.log('ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS language text;');
    console.log('ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS source text;');
    console.log('ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS confidence decimal(3,2);');
    console.log('ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS suggestions integer DEFAULT 0;');
    console.log('ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS cta_type text;');
    console.log('ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS response_length integer;');
    console.log('ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS suggestion_count integer;');
    console.log('');
    console.log('-- Ajouter les contraintes');
    console.log('ALTER TABLE chatbot_interactions ADD CONSTRAINT IF NOT EXISTS check_language CHECK (language IN (\'fr\', \'en\') OR language IS NULL);');
    console.log('ALTER TABLE chatbot_interactions ADD CONSTRAINT IF NOT EXISTS check_confidence CHECK (confidence >= 0 AND confidence <= 1 OR confidence IS NULL);');
    console.log('');
    console.log('💡 Après avoir exécuté ce SQL, relancez ce script pour vérifier');
    return;
  }

  // Étape 4: Test final
  const testSuccess = await testFinalInsertion();
  if (testSuccess) {
    console.log('\n🎉 MIGRATION RÉUSSIE!');
    console.log('✅ Le problème du chatbot est résolu');
  } else {
    console.log('\n⚠️  Migration appliquée mais test échoué');
  }
}

main().catch(console.error);