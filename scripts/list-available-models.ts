/**
 * Script pour lister tous les modèles Vertex AI disponibles
 * Usage: npx tsx scripts/list-available-models.ts
 */

import { GoogleAuth } from 'google-auth-library';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function listAvailableModels() {
  console.log('🔍 Recherche des modèles Vertex AI disponibles...\n');

  const projectId = process.env['GOOGLE_CLOUD_PROJECT_ID'];
  const location = process.env['GOOGLE_CLOUD_LOCATION'] || 'us-central1';

  if (!projectId) {
    console.error('❌ GOOGLE_CLOUD_PROJECT_ID non configuré');
    process.exit(1);
  }

  console.log(`📋 Configuration:`);
  console.log(`   Project: ${projectId}`);
  console.log(`   Location: ${location}\n`);

  try {
    // Authenticate
    console.log('🔐 Authentification...');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken || !accessToken.token) {
      throw new Error('Failed to obtain access token');
    }

    console.log('✅ Authentification réussie\n');

    // Liste des modèles Gemini à tester
    const modelsToTest = [
      'gemini-pro',
      'gemini-1.0-pro',
      'gemini-1.0-pro-001',
      'gemini-1.0-pro-002',
      'gemini-1.5-pro',
      'gemini-1.5-pro-001',
      'gemini-1.5-pro-002',
      'gemini-1.5-flash',
      'gemini-1.5-flash-001',
      'gemini-1.5-flash-002',
      'gemini-2.0-flash-exp',
      'text-bison',
      'text-bison-32k',
      'chat-bison',
      'chat-bison-32k'
    ];

    console.log('🧪 Test des modèles disponibles...\n');

    const availableModels: string[] = [];
    const unavailableModels: string[] = [];

    for (const model of modelsToTest) {
      process.stdout.write(`   Testing ${model.padEnd(30)} ... `);

      const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken.token}`
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Test' }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 10
            }
          })
        });

        if (response.ok) {
          console.log('✅ DISPONIBLE');
          availableModels.push(model);
        } else {
          const error = await response.json();
          if (error.error?.code === 404) {
            console.log('❌ Non trouvé');
            unavailableModels.push(model);
          } else if (error.error?.code === 403) {
            console.log('⚠️  Pas de permission');
            unavailableModels.push(model);
          } else {
            console.log(`⚠️  Erreur ${error.error?.code || 'inconnue'}`);
            unavailableModels.push(model);
          }
        }
      } catch (error: any) {
        console.log(`❌ Erreur: ${error.message}`);
        unavailableModels.push(model);
      }

      // Petit délai pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Résumé
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ\n');

    if (availableModels.length > 0) {
      console.log('✅ MODÈLES DISPONIBLES:');
      availableModels.forEach(model => {
        console.log(`   ✓ ${model}`);
      });
      console.log('');
    } else {
      console.log('❌ Aucun modèle disponible trouvé\n');
    }

    if (unavailableModels.length > 0) {
      console.log('❌ MODÈLES NON DISPONIBLES:');
      unavailableModels.forEach(model => {
        console.log(`   ✗ ${model}`);
      });
      console.log('');
    }

    // Recommandation
    console.log('💡 RECOMMANDATION:\n');
    if (availableModels.length > 0) {
      const recommended = availableModels.find(m => m.includes('1.5-pro')) || 
                         availableModels.find(m => m.includes('1.5-flash')) ||
                         availableModels.find(m => m.includes('pro')) ||
                         availableModels[0];
      
      console.log(`   Utiliser: ${recommended}`);
      console.log(`\n   Dans pages/api/chat/gemini.ts, ligne 535:`);
      console.log(`   const url = \`https://\${location}-aiplatform.googleapis.com/v1/projects/\${projectId}/locations/\${location}/publishers/google/models/${recommended}:generateContent\`;\n`);
    } else {
      console.log('   ⚠️  Aucun modèle disponible. Vérifiez:');
      console.log('   1. Vertex AI API est activée');
      console.log('   2. Billing est activé');
      console.log('   3. Service account a les permissions nécessaires\n');
    }

    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  }
}

// Run
listAvailableModels().catch(console.error);
