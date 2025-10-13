/**
 * Script de test Vertex AI Speech (STT/TTS)
 * 
 * Purpose: Vérifie que STT et TTS fonctionnent avec Vertex AI
 * Usage: npx tsx scripts/test-vertex-ai-speech.ts
 * 
 * Requirements:
 * - GOOGLE_CLOUD_PROJECT_ID in .env.local
 * - GOOGLE_CLOUD_LOCATION in .env.local
 * - GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLOUD_CREDENTIALS_BASE64
 * 
 * @security Uses service account credentials - run server-side only
 */

import { vertexAISpeechService } from '../src/lib/vertex-ai-speech-service';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testVertexAISpeech() {
  console.log('🔍 Testing Vertex AI Speech (STT/TTS)...\n');

  // Step 1: Verify configuration
  console.log('📋 Step 1: Verifying configuration...');
  const projectId = process.env['GOOGLE_CLOUD_PROJECT_ID'];
  const location = process.env['GOOGLE_CLOUD_LOCATION'] || 'us-central1';

  if (!projectId) {
    console.error('❌ GOOGLE_CLOUD_PROJECT_ID not set in .env.local');
    console.error('\n📝 Add to .env.local:');
    console.error('   GOOGLE_CLOUD_PROJECT_ID=your-project-id\n');
    process.exit(1);
  }

  console.log(`✅ Project ID: ${projectId}`);
  console.log(`✅ Location: ${location}\n`);

  // Step 2: Check service availability
  console.log('📋 Step 2: Checking service availability...');
  const isAvailable = vertexAISpeechService.isAvailable();
  
  if (!isAvailable) {
    console.error('❌ Vertex AI Speech service not available');
    console.error('\n📝 Ensure one of these is set:');
    console.error('   - GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json');
    console.error('   - GOOGLE_CLOUD_CREDENTIALS_BASE64=<base64-encoded-json>\n');
    process.exit(1);
  }

  console.log('✅ Vertex AI Speech service is available\n');

  // Step 3: Test TTS (French)
  console.log('📋 Step 3: Testing TTS (French)...');
  try {
    const testTextFr = 'Bonjour, je suis OMADIGITAL, votre assistant IA pour automatiser votre business.';
    console.log(`   Text: "${testTextFr}"`);
    
    const ttsResultFr = await vertexAISpeechService.synthesizeText(testTextFr, 'fr', false);
    
    if (ttsResultFr.audioContent) {
      console.log('✅ TTS French successful');
      console.log(`   Audio size: ${ttsResultFr.audioContent.length} bytes (base64)\n`);
      
      // Save audio to file for manual verification
      const audioBytes = Uint8Array.from(atob(ttsResultFr.audioContent), c => c.charCodeAt(0));
      writeFileSync('test-tts-fr.mp3', Buffer.from(audioBytes));
      console.log('💾 Saved to: test-tts-fr.mp3\n');
    } else {
      throw new Error('No audio content returned');
    }
  } catch (error) {
    console.error('❌ TTS French failed:', error);
    console.error('\n📝 Troubleshooting:');
    console.error('   1. Verify Text-to-Speech API is enabled in Google Cloud');
    console.error('   2. Check service account has "Cloud Text-to-Speech API User" role');
    console.error('   3. Verify billing is enabled\n');
    process.exit(1);
  }

  // Step 4: Test TTS (English)
  console.log('📋 Step 4: Testing TTS (English)...');
  try {
    const testTextEn = 'Hello, I am OMADIGITAL, your AI assistant to automate your business.';
    console.log(`   Text: "${testTextEn}"`);
    
    const ttsResultEn = await vertexAISpeechService.synthesizeText(testTextEn, 'en', false);
    
    if (ttsResultEn.audioContent) {
      console.log('✅ TTS English successful');
      console.log(`   Audio size: ${ttsResultEn.audioContent.length} bytes (base64)\n`);
      
      // Save audio to file for manual verification
      const audioBytes = Uint8Array.from(atob(ttsResultEn.audioContent), c => c.charCodeAt(0));
      writeFileSync('test-tts-en.mp3', Buffer.from(audioBytes));
      console.log('💾 Saved to: test-tts-en.mp3\n');
    } else {
      throw new Error('No audio content returned');
    }
  } catch (error) {
    console.error('❌ TTS English failed:', error);
    process.exit(1);
  }

  // Step 5: Test STT (simulated - requires actual audio)
  console.log('📋 Step 5: Testing STT (simulated)...');
  console.log('⚠️  STT requires actual audio input');
  console.log('   To test STT:');
  console.log('   1. Start the dev server: npm run dev');
  console.log('   2. Open the chatbot');
  console.log('   3. Click the microphone button');
  console.log('   4. Speak in French or English');
  console.log('   5. Check console logs for Vertex AI STT results\n');

  // Step 6: Summary
  console.log('📊 Test Summary:');
  console.log('   ✅ Configuration verified');
  console.log('   ✅ Service available');
  console.log('   ✅ TTS French working');
  console.log('   ✅ TTS English working');
  console.log('   ⚠️  STT requires manual testing with microphone\n');

  console.log('🎉 Vertex AI Speech tests passed!\n');
  console.log('📝 Next steps:');
  console.log('   1. Test STT manually in the chatbot');
  console.log('   2. Verify language detection works (FR/EN)');
  console.log('   3. Check audio quality of generated speech\n');
}

// Run tests
testVertexAISpeech().catch((error) => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
