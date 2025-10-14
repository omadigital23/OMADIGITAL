/**
 * Script de diagnostic pour vérifier la configuration STT/TTS
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Vérification de la configuration STT/TTS...\n');

// Vérifier les variables d'environnement
const checks = [
  {
    name: 'GOOGLE_CLOUD_API_KEY',
    value: process.env.GOOGLE_CLOUD_API_KEY,
    required: false,
    description: 'Clé API Google Cloud (utilisée par google-cloud-speech-service.ts)'
  },
  {
    name: 'GOOGLE_AI_API_KEY',
    value: process.env.GOOGLE_AI_API_KEY,
    required: false,
    description: 'Clé API Google AI (utilisée par vertex-ai-service.ts)'
  },
  {
    name: 'GOOGLE_CLOUD_PROJECT_ID',
    value: process.env.GOOGLE_CLOUD_PROJECT_ID,
    required: false,
    description: 'ID du projet Google Cloud'
  },
  {
    name: 'GCP_PROJECT',
    value: process.env.GCP_PROJECT,
    required: false,
    description: 'ID du projet GCP (alternative)'
  },
  {
    name: 'GOOGLE_CLOUD_LOCATION',
    value: process.env.GOOGLE_CLOUD_LOCATION,
    required: false,
    description: 'Région Google Cloud'
  },
  {
    name: 'GCP_LOCATION',
    value: process.env.GCP_LOCATION,
    required: false,
    description: 'Région GCP (alternative)'
  },
  {
    name: 'GOOGLE_CLOUD_CLIENT_EMAIL',
    value: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    required: false,
    description: 'Email du service account'
  },
  {
    name: 'GOOGLE_CLOUD_PRIVATE_KEY',
    value: process.env.GOOGLE_CLOUD_PRIVATE_KEY,
    required: false,
    description: 'Clé privée du service account'
  }
];

let hasErrors = false;
let hasWarnings = false;

console.log('📋 Variables d\'environnement:\n');

checks.forEach(check => {
  const isSet = !!check.value;
  const status = isSet ? '✅' : (check.required ? '❌' : '⚠️');
  const valuePreview = isSet 
    ? (check.value.length > 50 ? `${check.value.substring(0, 20)}...` : check.value)
    : 'NON DÉFINIE';
  
  console.log(`${status} ${check.name}`);
  console.log(`   Description: ${check.description}`);
  console.log(`   Valeur: ${valuePreview}`);
  console.log('');
  
  if (!isSet && check.required) {
    hasErrors = true;
  } else if (!isSet && !check.required) {
    hasWarnings = true;
  }
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Déterminer quelle méthode d'authentification est configurée
const hasGoogleCloudApiKey = !!process.env.GOOGLE_CLOUD_API_KEY;
const hasGoogleAiApiKey = !!process.env.GOOGLE_AI_API_KEY;
const hasServiceAccount = !!(
  process.env.GOOGLE_CLOUD_CLIENT_EMAIL && 
  process.env.GOOGLE_CLOUD_PRIVATE_KEY &&
  (process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.GCP_PROJECT)
);

console.log('🔐 Méthodes d\'authentification disponibles:\n');

if (hasGoogleCloudApiKey) {
  console.log('✅ Google Cloud API Key (GOOGLE_CLOUD_API_KEY)');
  console.log('   → Utilisé par: google-cloud-speech-service.ts');
}

if (hasGoogleAiApiKey) {
  console.log('✅ Google AI API Key (GOOGLE_AI_API_KEY)');
  console.log('   → Utilisé par: vertex-ai-service.ts');
}

if (hasServiceAccount) {
  console.log('✅ Service Account credentials');
  console.log('   → Email:', process.env.GOOGLE_CLOUD_CLIENT_EMAIL);
  console.log('   → Project:', process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.GCP_PROJECT);
}

if (!hasGoogleCloudApiKey && !hasGoogleAiApiKey && !hasServiceAccount) {
  console.log('❌ AUCUNE méthode d\'authentification configurée!');
  console.log('');
  console.log('Pour que le STT fonctionne, vous devez configurer AU MOINS UNE de ces options:');
  console.log('');
  console.log('Option 1 (Plus simple): API Key Google Cloud');
  console.log('  1. Allez sur https://console.cloud.google.com/apis/credentials');
  console.log('  2. Créez une clé API');
  console.log('  3. Activez les APIs Speech-to-Text et Text-to-Speech');
  console.log('  4. Ajoutez dans .env.local:');
  console.log('     GOOGLE_CLOUD_API_KEY=votre_cle_api');
  console.log('');
  console.log('Option 2 (Production): Service Account');
  console.log('  1. Créez un service account sur Google Cloud Console');
  console.log('  2. Téléchargez le fichier JSON des credentials');
  console.log('  3. Ajoutez dans .env.local:');
  console.log('     GOOGLE_CLOUD_CLIENT_EMAIL=...');
  console.log('     GOOGLE_CLOUD_PRIVATE_KEY=...');
  console.log('     GOOGLE_CLOUD_PROJECT_ID=...');
  hasErrors = true;
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (hasErrors) {
  console.log('❌ ERREUR: Configuration incomplète');
  console.log('   Le service STT/TTS ne fonctionnera pas.\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  AVERTISSEMENT: Configuration partielle');
  console.log('   Le service STT/TTS devrait fonctionner avec les credentials disponibles.\n');
  process.exit(0);
} else {
  console.log('✅ Configuration OK');
  console.log('   Le service STT/TTS est correctement configuré.\n');
  process.exit(0);
}
