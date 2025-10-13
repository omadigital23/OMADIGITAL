#!/usr/bin/env node

/**
 * 🔐 Script de Génération des Credentials Admin
 * 
 * Ce script génère les valeurs nécessaires pour l'authentification admin :
 * - ADMIN_SALT : Un salt aléatoire pour le hashing
 * - ADMIN_PASSWORD_HASH : Le hash sécurisé du mot de passe
 * 
 * Usage:
 *   node generate-admin-credentials.js
 *   node generate-admin-credentials.js VotreMotDePasse
 */

const crypto = require('crypto');
const readline = require('readline');

// Fonction pour hasher un mot de passe
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Fonction pour valider la force du mot de passe
function validatePassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('❌ Le mot de passe doit contenir au moins 8 caractères');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('❌ Le mot de passe doit contenir au moins une minuscule');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('❌ Le mot de passe doit contenir au moins une majuscule');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('❌ Le mot de passe doit contenir au moins un chiffre');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('⚠️  Recommandé : Ajoutez un caractère spécial pour plus de sécurité');
  }
  
  return errors;
}

// Fonction principale
async function generateCredentials() {
  console.log('\n🔐 Générateur de Credentials Admin\n');
  console.log('=' .repeat(60));
  
  // Vérifier si un mot de passe a été passé en argument
  const passwordArg = process.argv[2];
  
  if (passwordArg) {
    // Mode non-interactif
    await processPassword(passwordArg);
  } else {
    // Mode interactif
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('\n📝 Entrez le mot de passe admin souhaité: ', (password) => {
      rl.close();
      processPassword(password);
    });
  }
}

async function processPassword(password) {
  if (!password || password.trim() === '') {
    console.error('\n❌ Erreur: Le mot de passe ne peut pas être vide\n');
    process.exit(1);
  }
  
  // Valider le mot de passe
  const errors = validatePassword(password);
  if (errors.length > 0) {
    console.log('\n⚠️  Validation du mot de passe:\n');
    errors.forEach(err => console.log('  ' + err));
    console.log('');
    
    if (errors.some(e => e.startsWith('❌'))) {
      console.error('❌ Le mot de passe ne respecte pas les exigences minimales\n');
      process.exit(1);
    }
  }
  
  // Générer un salt aléatoire (16 bytes = 32 caractères hex)
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Générer le hash du mot de passe
  const hash = hashPassword(password, salt);
  
  // Afficher les résultats
  console.log('\n✅ Credentials générés avec succès!\n');
  console.log('=' .repeat(60));
  console.log('\n📋 Copiez ces valeurs dans vos variables d\'environnement:\n');
  console.log('ADMIN_USERNAME=admin');
  console.log(`ADMIN_SALT=${salt}`);
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log('\n' + '='.repeat(60));
  
  // Instructions
  console.log('\n📖 Instructions:\n');
  console.log('1. Sur Vercel:');
  console.log('   - Allez dans Settings → Environment Variables');
  console.log('   - Ajoutez les 3 variables ci-dessus');
  console.log('   - Redéployez votre application\n');
  
  console.log('2. Sur Netlify:');
  console.log('   - Allez dans Site settings → Environment variables');
  console.log('   - Ajoutez les 3 variables ci-dessus');
  console.log('   - Redéployez votre site\n');
  
  console.log('3. En local (.env.local):');
  console.log('   - Ajoutez les 3 variables dans votre fichier .env.local');
  console.log('   - Redémarrez votre serveur de développement\n');
  
  // Avertissements de sécurité
  console.log('🔒 Sécurité:\n');
  console.log('   ⚠️  Ne commitez JAMAIS ces valeurs dans Git');
  console.log('   ⚠️  Ne les partagez pas publiquement');
  console.log('   ⚠️  Stockez-les dans un gestionnaire de mots de passe');
  console.log('   ⚠️  Changez le mot de passe régulièrement\n');
  
  // Informations techniques
  console.log('📊 Informations techniques:\n');
  console.log(`   - Salt length: ${salt.length} caractères (${Buffer.from(salt, 'hex').length} bytes)`);
  console.log(`   - Hash length: ${hash.length} caractères (${Buffer.from(hash, 'hex').length} bytes)`);
  console.log(`   - Algorithm: PBKDF2-SHA512 (10,000 iterations)`);
  console.log(`   - Password strength: ${getPasswordStrength(password)}\n`);
  
  console.log('=' .repeat(60));
  console.log('\n✅ Configuration terminée!\n');
}

// Fonction pour évaluer la force du mot de passe
function getPasswordStrength(password) {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  if (password.length >= 20) score++;
  
  if (score <= 3) return '🔴 Faible';
  if (score <= 5) return '🟡 Moyen';
  if (score <= 7) return '🟢 Fort';
  return '🟢 Très Fort';
}

// Exécuter le script
generateCredentials().catch(error => {
  console.error('\n❌ Erreur:', error.message);
  process.exit(1);
});
