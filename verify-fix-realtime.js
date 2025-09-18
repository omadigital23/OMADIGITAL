#!/usr/bin/env node

/**
 * Script de vérification en temps réel du fix chatbot
 * À exécuter APRÈS avoir appliqué la migration dans le dashboard
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNzcyMzksImV4cCI6MjA3Mjk1MzIzOX0.OT-zQbg0Q8BzupmUzQH9xNL8aRCKNO73onKlsaLaE30';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 VÉRIFICATION EN TEMPS RÉEL DU FIX');
console.log('═'.repeat(45));

async function simulateOriginalError() {
  console.log('\n🧪 SIMULATION DE L\'ERREUR ORIGINALE');
  console.log('─'.repeat(40));
  
  // Reproduire exactement le code qui causait l'erreur
  const problematicData = {
    message_id: `verify_fix_${Date.now()}`,
    session_id: 'verify_session',
    message_text: 'Test de vérification du fix',
    response_text: 'Réponse de vérification - le fix fonctionne !',
    input_method: 'text',
    response_time: 1234,
    timestamp: new Date().toISOString(),
    // Ces colonnes causaient l'erreur avant le fix
    language: 'fr',
    source: 'ultra_intelligent_rag',
    confidence: 0.95,
    suggestions: 3,
    cta_type: 'contact',
    response_length: 45,
    suggestion_count: 3
  };

  console.log('📤 Tentative d\'insertion des données problématiques...');
  console.log('🎯 Colonnes testées: language, source, confidence, suggestions, cta_type, response_length, suggestion_count');

  try {
    const { data, error } = await supabase
      .from('chatbot_interactions')
      .insert([problematicData])
      .select();

    if (error) {
      console.error('❌ ERREUR PERSISTANTE:', error.message);
      
      if (error.message.includes('confidence') || 
          error.message.includes('language') || 
          error.message.includes('source')) {
        console.log('\n💡 DIAGNOSTIC:');
        console.log('   - La migration n\'a pas encore été appliquée');
        console.log('   - Ou il y a eu une erreur lors de l\'exécution du SQL');
        console.log('   - Vérifiez le dashboard Supabase pour les erreurs');
      }
      
      return false;
    }

    console.log('✅ SUCCÈS! Insertion réussie avec toutes les nouvelles colonnes');
    console.log('📊 Données insérées:', {
      message_id: data[0].message_id,
      language: data[0].language,
      source: data[0].source,
      confidence: data[0].confidence,
      cta_type: data[0].cta_type
    });

    // Nettoyer les données de test
    await supabase
      .from('chatbot_interactions')
      .delete()
      .eq('message_id', problematicData.message_id);
    
    console.log('🧹 Données de test nettoyées');
    return true;

  } catch (error) {
    console.error('❌ EXCEPTION:', error.message);
    return false;
  }
}

async function testAnalyticsFunction() {
  console.log('\n🔬 TEST DE LA FONCTION ANALYTICS');
  console.log('─'.repeat(40));

  // Simuler exactement la fonction trackChatbotInteraction
  const trackChatbotInteraction = async (interaction) => {
    try {
      const interactionWithDefaults = {
        ...interaction,
        timestamp: new Date().toISOString(),
        session_id: interaction.session_id || `session_${Date.now()}`
      };

      const { data, error } = await supabase
        .from('chatbot_interactions')
        .insert([interactionWithDefaults]);
      
      if (error) {
        console.error('❌ Erreur dans trackChatbotInteraction:', error.message);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('❌ Exception dans trackChatbotInteraction:', error.message);
      return null;
    }
  };

  // Test avec les données exactes du code original
  const testInteraction = {
    message_id: `analytics_test_${Date.now()}`,
    session_id: 'analytics_test_session',
    message_text: 'Bonjour, test analytics',
    response_text: 'Bonjour! Test de la fonction analytics réparée.',
    input_method: 'text',
    response_time: 1500,
    language: 'fr',
    source: 'ultra_intelligent_rag',
    confidence: 0.92,
    suggestions: 2,
    cta_type: 'demo',
    response_length: 48,
    suggestion_count: 2
  };

  console.log('📊 Test de trackChatbotInteraction...');
  const result = await trackChatbotInteraction(testInteraction);

  if (result !== null) {
    console.log('✅ FONCTION ANALYTICS RÉPARÉE!');
    
    // Nettoyer
    await supabase
      .from('chatbot_interactions')
      .delete()
      .eq('message_id', testInteraction.message_id);
    
    return true;
  } else {
    console.log('❌ Fonction analytics toujours défaillante');
    return false;
  }
}

async function checkAllColumns() {
  console.log('\n📋 VÉRIFICATION DE TOUTES LES COLONNES');
  console.log('─'.repeat(40));

  const requiredColumns = [
    'message_id', 'session_id', 'message_text', 'response_text', 
    'input_method', 'response_time', 'timestamp',
    // Nouvelles colonnes ajoutées
    'language', 'source', 'confidence', 'suggestions', 
    'cta_type', 'response_length', 'suggestion_count'
  ];

  // Test d'insertion avec toutes les colonnes
  const fullTestData = {};
  requiredColumns.forEach(col => {
    switch(col) {
      case 'message_id':
        fullTestData[col] = `full_test_${Date.now()}`;
        break;
      case 'session_id':
        fullTestData[col] = 'full_test_session';
        break;
      case 'message_text':
        fullTestData[col] = 'Test complet de toutes les colonnes';
        break;
      case 'response_text':
        fullTestData[col] = 'Réponse test complet';
        break;
      case 'input_method':
        fullTestData[col] = 'text';
        break;
      case 'response_time':
        fullTestData[col] = 2000;
        break;
      case 'timestamp':
        fullTestData[col] = new Date().toISOString();
        break;
      case 'language':
        fullTestData[col] = 'en';
        break;
      case 'source':
        fullTestData[col] = 'test_source';
        break;
      case 'confidence':
        fullTestData[col] = 0.88;
        break;
      case 'suggestions':
        fullTestData[col] = 1;
        break;
      case 'cta_type':
        fullTestData[col] = 'quote';
        break;
      case 'response_length':
        fullTestData[col] = 18;
        break;
      case 'suggestion_count':
        fullTestData[col] = 1;
        break;
    }
  });

  console.log('🔍 Test d\'insertion avec toutes les colonnes...');
  
  try {
    const { data, error } = await supabase
      .from('chatbot_interactions')
      .insert([fullTestData])
      .select();

    if (error) {
      console.error('❌ Erreur avec les colonnes:', error.message);
      return false;
    }

    console.log('✅ TOUTES LES COLONNES FONCTIONNENT!');
    console.log('📊 Colonnes testées avec succès:');
    
    requiredColumns.forEach(col => {
      const value = data[0][col];
      console.log(`   ✓ ${col}: ${value !== null && value !== undefined ? '✅' : '⚠️'}`);
    });

    // Nettoyer
    await supabase
      .from('chatbot_interactions')
      .delete()
      .eq('message_id', fullTestData.message_id);

    return true;

  } catch (error) {
    console.error('❌ Exception:', error.message);
    return false;
  }
}

async function main() {
  console.log('🎯 Vérification que le fix du chatbot a été appliqué avec succès...\n');

  let allTestsPassed = true;

  // Test 1: Simulation de l'erreur originale
  console.log('TEST 1/3: Reproduction du problème original');
  const originalFixed = await simulateOriginalError();
  allTestsPassed = allTestsPassed && originalFixed;

  // Test 2: Fonction analytics
  console.log('\nTEST 2/3: Fonction trackChatbotInteraction');
  const analyticsFixed = await testAnalyticsFunction();
  allTestsPassed = allTestsPassed && analyticsFixed;

  // Test 3: Toutes les colonnes
  console.log('\nTEST 3/3: Vérification complète des colonnes');
  const allColumnsOk = await checkAllColumns();
  allTestsPassed = allTestsPassed && allColumnsOk;

  // Résumé final
  console.log('\n' + '═'.repeat(45));
  console.log('📊 RÉSUMÉ DE LA VÉRIFICATION');
  console.log('═'.repeat(45));
  
  console.log(`🎯 Problème original: ${originalFixed ? '✅ RÉSOLU' : '❌ PERSISTE'}`);
  console.log(`📊 Fonction analytics: ${analyticsFixed ? '✅ RÉPARÉE' : '❌ DÉFAILLANTE'}`);
  console.log(`📋 Toutes les colonnes: ${allColumnsOk ? '✅ FONCTIONNELLES' : '❌ PROBLÉMATIQUES'}`);
  
  console.log('─'.repeat(45));
  
  if (allTestsPassed) {
    console.log('🎉 FÉLICITATIONS! LE FIX EST COMPLET!');
    console.log('✅ Le chatbot fonctionne maintenant parfaitement');
    console.log('✅ Toutes les analytics sont opérationnelles');
    console.log('✅ Plus d\'erreurs "confidence column"');
    console.log('\n💡 Vous pouvez maintenant utiliser le chatbot sans problème!');
  } else {
    console.log('⚠️  ATTENTION: CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('🔧 Actions recommandées:');
    console.log('   1. Vérifiez que le SQL a été exécuté correctement dans Supabase');
    console.log('   2. Consultez les logs d\'erreur dans le dashboard');
    console.log('   3. Relancez ce script après correction');
  }

  process.exit(allTestsPassed ? 0 : 1);
}

// Exécuter la vérification
main().catch(console.error);