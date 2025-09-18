#!/usr/bin/env node

/**
 * Script de test pour vérifier que le fix du chatbot fonctionne
 * Simule exactement le code qui causait l'erreur
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fonction trackChatbotInteraction simulée (copie exacte du code problématique)
async function trackChatbotInteraction(interaction) {
  try {
    const interactionWithDefaults = {
      ...interaction,
      timestamp: new Date().toISOString(),
      session_id: interaction.session_id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    console.log('📤 Tentative d\'insertion des données:');
    console.log(JSON.stringify(interactionWithDefaults, null, 2));

    const { data, error } = await supabase
      .from('chatbot_interactions')
      .insert([interactionWithDefaults]);
    
    if (error) {
      console.error('❌ Erreur lors du tracking:', error);
      return null;
    }
    
    console.log('✅ Insertion réussie!');
    return data;
  } catch (error) {
    console.error('❌ Exception lors du tracking:', error);
    return null;
  }
}

async function testOriginalProblem() {
  console.log('🧪 TEST: Reproduction du problème original');
  console.log('─'.repeat(50));

  // Données exactes qui causaient l'erreur (copiées de useChatLogic.ts)
  const problematicData = {
    message_id: `test_fix_${Date.now()}`,
    session_id: 'test_session_fix',
    message_text: 'Bonjour, pouvez-vous m\'aider?',
    response_text: 'Bonjour! Je suis là pour vous aider avec vos besoins en transformation digitale.',
    input_method: 'text',
    response_time: 1234,
    timestamp: new Date().toISOString(),
    language: 'fr',                    // ❌ Causait l'erreur avant
    source: 'ultra_intelligent_rag',   // ❌ Causait l'erreur avant
    confidence: 0.95,                  // ❌ Causait l'erreur avant (colonne principale du problème)
    suggestions: 3,                    // ❌ Causait l'erreur avant
    cta_type: 'contact',              // ❌ Causait l'erreur avant
    response_length: 89,              // ❌ Causait l'erreur avant
    suggestion_count: 3               // ❌ Causait l'erreur avant
  };

  console.log('🎯 Test avec les données qui causaient l\'erreur...');
  const result = await trackChatbotInteraction(problematicData);

  if (result !== null) {
    console.log('✅ SUCCESS: Le problème est résolu!');
    
    // Nettoyer les données de test
    await supabase
      .from('chatbot_interactions')
      .delete()
      .eq('message_id', problematicData.message_id);
    
    console.log('🧹 Données de test nettoyées');
    return true;
  } else {
    console.log('❌ FAILED: Le problème persiste');
    return false;
  }
}

async function testEdgeCases() {
  console.log('\n🧪 TEST: Cas limites');
  console.log('─'.repeat(50));

  const testCases = [
    {
      name: 'Données minimales (colonnes obligatoires seulement)',
      data: {
        message_id: `test_minimal_${Date.now()}`,
        session_id: 'test_session_minimal',
        message_text: 'Test minimal',
        response_text: 'Réponse minimale',
        input_method: 'text',
        response_time: 500
      }
    },
    {
      name: 'Toutes les nouvelles colonnes à null',
      data: {
        message_id: `test_nulls_${Date.now()}`,
        session_id: 'test_session_nulls',
        message_text: 'Test avec nulls',
        response_text: 'Réponse avec nulls',
        input_method: 'voice',
        response_time: 750,
        language: null,
        source: null,
        confidence: null,
        suggestions: null,
        cta_type: null,
        response_length: null,
        suggestion_count: null
      }
    },
    {
      name: 'Valeurs limites',
      data: {
        message_id: `test_limits_${Date.now()}`,
        session_id: 'test_session_limits',
        message_text: 'Test valeurs limites',
        response_text: 'Réponse valeurs limites',
        input_method: 'text',
        response_time: 1,
        language: 'en',
        source: 'test_source',
        confidence: 1.0,  // Maximum
        suggestions: 0,   // Minimum
        cta_type: 'quote',
        response_length: 0,
        suggestion_count: 10
      }
    }
  ];

  let allPassed = true;
  const testIds = [];

  for (const testCase of testCases) {
    console.log(`\n🔍 ${testCase.name}...`);
    
    const result = await trackChatbotInteraction(testCase.data);
    
    if (result !== null) {
      console.log('   ✅ Réussi');
      testIds.push(testCase.data.message_id);
    } else {
      console.log('   ❌ Échoué');
      allPassed = false;
    }
  }

  // Nettoyer tous les tests
  if (testIds.length > 0) {
    await supabase
      .from('chatbot_interactions')
      .delete()
      .in('message_id', testIds);
    console.log('\n🧹 Tous les tests nettoyés');
  }

  return allPassed;
}

async function verifyConstraints() {
  console.log('\n🧪 TEST: Vérification des contraintes');
  console.log('─'.repeat(50));

  const invalidCases = [
    {
      name: 'Langue invalide',
      data: {
        message_id: `test_invalid_lang_${Date.now()}`,
        session_id: 'test_session',
        message_text: 'Test',
        response_text: 'Test',
        input_method: 'text',
        response_time: 500,
        language: 'es'  // ❌ Devrait échouer (seulement fr/en autorisés)
      },
      shouldFail: true
    },
    {
      name: 'Confidence invalide (> 1)',
      data: {
        message_id: `test_invalid_conf_${Date.now()}`,
        session_id: 'test_session',
        message_text: 'Test',
        response_text: 'Test',
        input_method: 'text',
        response_time: 500,
        confidence: 1.5  // ❌ Devrait échouer (max 1.0)
      },
      shouldFail: true
    },
    {
      name: 'CTA type invalide',
      data: {
        message_id: `test_invalid_cta_${Date.now()}`,
        session_id: 'test_session',
        message_text: 'Test',
        response_text: 'Test',
        input_method: 'text',
        response_time: 500,
        cta_type: 'invalid_type'  // ❌ Devrait échouer
      },
      shouldFail: true
    }
  ];

  let constraintsWorking = true;

  for (const testCase of invalidCases) {
    console.log(`\n🔍 ${testCase.name}...`);
    
    const result = await trackChatbotInteraction(testCase.data);
    
    if (testCase.shouldFail) {
      if (result === null) {
        console.log('   ✅ Contrainte fonctionne (échec attendu)');
      } else {
        console.log('   ❌ Contrainte ne fonctionne pas (succès inattendu)');
        constraintsWorking = false;
        // Nettoyer si insertion réussie par erreur
        await supabase
          .from('chatbot_interactions')
          .delete()
          .eq('message_id', testCase.data.message_id);
      }
    }
  }

  return constraintsWorking;
}

async function main() {
  console.log('🔧 TEST DE VALIDATION DU FIX CHATBOT');
  console.log('═'.repeat(50));

  let allTestsPassed = true;

  // Test 1: Problème original
  const originalFixed = await testOriginalProblem();
  allTestsPassed = allTestsPassed && originalFixed;

  // Test 2: Cas limites
  const edgeCasesPassed = await testEdgeCases();
  allTestsPassed = allTestsPassed && edgeCasesPassed;

  // Test 3: Contraintes
  const constraintsPassed = await verifyConstraints();
  allTestsPassed = allTestsPassed && constraintsPassed;

  // Résumé final
  console.log('\n' + '═'.repeat(50));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('═'.repeat(50));
  console.log(`🎯 Problème original: ${originalFixed ? '✅ RÉSOLU' : '❌ PERSISTE'}`);
  console.log(`🔍 Cas limites: ${edgeCasesPassed ? '✅ PASSÉS' : '❌ ÉCHOUÉS'}`);
  console.log(`🛡️  Contraintes: ${constraintsPassed ? '✅ ACTIVES' : '❌ INACTIVES'}`);
  console.log('─'.repeat(50));
  
  if (allTestsPassed) {
    console.log('🎉 TOUS LES TESTS RÉUSSIS!');
    console.log('💡 Le chatbot devrait maintenant fonctionner sans erreur.');
  } else {
    console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('⚠️  Vérification manuelle requise.');
  }

  process.exit(allTestsPassed ? 0 : 1);
}

// Exécuter les tests
main().catch(console.error);