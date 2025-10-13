/**
 * Script pour configurer Google Cloud Speech & TTS APIs
 * Usage: node scripts/setup-google-cloud-apis.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Configuration Google Cloud Speech & TTS APIs...\n');

// Get API key from environment variables for security
const GOOGLE_CLOUD_API_KEY = process.env.GOOGLE_CLOUD_API_KEY || process.env.GOOGLE_AI_API_KEY;

if (!GOOGLE_CLOUD_API_KEY) {
  console.error('Error: GOOGLE_CLOUD_API_KEY or GOOGLE_AI_API_KEY environment variable not set');
  console.error('Please set one of these variables in your .env.local file');
  process.exit(1);
}

// Mettre à jour .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf-8');
  console.log('📝 Mise à jour de .env.local existant');
} else {
  console.log('📝 Création de .env.local');
}

// Fonction pour mettre à jour ou ajouter une variable
function updateEnvVar(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  } else {
    return content + `\n${key}=${value}`;
  }
}

// Ajouter la clé API Google Cloud
envContent = updateEnvVar(envContent, 'GOOGLE_CLOUD_API_KEY', GOOGLE_CLOUD_API_KEY);

// Écrire .env.local
fs.writeFileSync(envPath, envContent.trim() + '\n');
console.log('✅ .env.local mis à jour\n');

console.log('📋 Configuration terminée!\n');
console.log('🔑 API Key configurée:');
console.log(`   GOOGLE_CLOUD_API_KEY=${GOOGLE_CLOUD_API_KEY.substring(0, 20)}...`);
console.log('\n📝 Cette clé sera utilisée pour:');
console.log('   ✅ Google Cloud Speech-to-Text API');
console.log('   ✅ Google Cloud Text-to-Speech API');
console.log('\n⚠️  IMPORTANT:');
console.log('   - Cette clé est pour STT/TTS uniquement');
console.log('   - Vertex AI (Gemini LLM) utilise toujours Service Account');
console.log('   - Ne jamais exposer cette clé côté client\n');

console.log('🚀 Prochaines étapes:');
console.log('   1. Redémarrer le serveur: npm run dev');
console.log('   2. Tester STT/TTS dans le chatbot');
console.log('   3. Vérifier les logs: "Google Cloud Speech API"\n');