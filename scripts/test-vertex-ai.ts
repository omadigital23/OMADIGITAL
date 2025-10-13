/**
 * Vertex AI Configuration Test Script
 * 
 * Purpose: Verifies Vertex AI authentication and API connectivity
 * Usage: npx tsx scripts/test-vertex-ai.ts
 * 
 * Requirements:
 * - GOOGLE_CLOUD_PROJECT_ID in .env.local
 * - GOOGLE_CLOUD_LOCATION in .env.local (optional, defaults to us-central1)
 * - GOOGLE_APPLICATION_CREDENTIALS or default credentials configured
 * 
 * @security Uses service account credentials - run server-side only
 */

import { GoogleAuth } from 'google-auth-library';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testVertexAI() {
  const projectId = process.env['GOOGLE_CLOUD_PROJECT_ID'];
  const location = process.env['GOOGLE_CLOUD_LOCATION'] || 'us-central1';

  console.log('🔍 Testing Vertex AI configuration...\n');

  // Step 1: Verify environment variables
  if (!projectId) {
    console.error('❌ GOOGLE_CLOUD_PROJECT_ID not set in .env.local');
    console.error('\n📝 Add to .env.local:');
    console.error('   GOOGLE_CLOUD_PROJECT_ID=your-project-id\n');
    process.exit(1);
  }

  console.log(`✅ Project ID: ${projectId}`);
  console.log(`✅ Location: ${location}\n`);

  try {
    // Step 2: Test authentication
    console.log('🔐 Testing authentication...');
    
    let auth: GoogleAuth;
    
    // Check for base64 credentials (production)
    if (process.env['GOOGLE_CLOUD_CREDENTIALS_BASE64']) {
      console.log('   Using base64 credentials');
      const credentials = JSON.parse(
        Buffer.from(process.env['GOOGLE_CLOUD_CREDENTIALS_BASE64'], 'base64').toString('utf-8')
      );
      auth = new GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });
    } 
    // Check for credentials file path (development)
    else if (process.env['GOOGLE_APPLICATION_CREDENTIALS']) {
      console.log(`   Using credentials file: ${process.env['GOOGLE_APPLICATION_CREDENTIALS']}`);
      auth = new GoogleAuth({
        keyFilename: process.env['GOOGLE_APPLICATION_CREDENTIALS'],
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });
    } 
    // Use default credentials
    else {
      console.log('   Using default application credentials');
      auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });
    }
    
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken || !accessToken.token) {
      throw new Error('Failed to obtain access token');
    }

    console.log('✅ Authentication successful');
    console.log(`   Token: ${accessToken.token.substring(0, 30)}...\n`);

    // Step 3: Test Vertex AI API call
    console.log('🤖 Testing Vertex AI API call...');
    
    // Use Gemini 1.0 Pro (widely available)
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/gemini-1.0-pro:generateContent`;

    const testPrompt = `Tu es OMADIGITAL, l'assistant IA d'OMA Digital.

INSTRUCTIONS:
1. Détecte la langue du message (FR ou EN)
2. Réponds dans la même langue
3. Commence par [LANG:FR] ou [LANG:EN]
4. Sois concis (max 2 phrases)

Message utilisateur: "Bonjour, quels sont vos services?"

Réponse:`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.token}`
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: testPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
          topP: 0.8,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vertex API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No response generated from Vertex AI');
    }

    console.log('✅ Vertex AI API call successful\n');
    console.log('📝 Generated response:');
    console.log('   ' + generatedText.replace(/\n/g, '\n   '));
    console.log('\n🎉 All tests passed! Vertex AI is configured correctly.\n');

    // Step 4: Display configuration summary
    console.log('📊 Configuration Summary:');
    console.log(`   Project ID: ${projectId}`);
    console.log(`   Location: ${location}`);
    console.log(`   Model: gemini-1.0-pro`);
    console.log(`   Authentication: ✅ Working`);
    console.log(`   API Access: ✅ Working\n`);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('\n📝 Troubleshooting Guide:');
    console.error('\n1. Verify environment variables:');
    console.error('   - GOOGLE_CLOUD_PROJECT_ID is set');
    console.error('   - GOOGLE_CLOUD_LOCATION is set (optional)');
    console.error('   - GOOGLE_APPLICATION_CREDENTIALS points to valid JSON key\n');
    console.error('2. Check Google Cloud Console:');
    console.error('   - Vertex AI API is enabled');
    console.error('   - Service account has "Vertex AI User" role');
    console.error('   - Billing is enabled on the project\n');
    console.error('3. Verify credentials file:');
    console.error('   - File exists at specified path');
    console.error('   - File contains valid JSON');
    console.error('   - Service account email matches project\n');
    console.error('4. Check network connectivity:');
    console.error('   - Can reach aiplatform.googleapis.com');
    console.error('   - No firewall blocking Google Cloud APIs\n');
    console.error('📖 Full setup guide: docs/VERTEX_AI_SETUP.md\n');
    process.exit(1);
  }
}

// Run the test
testVertexAI();
