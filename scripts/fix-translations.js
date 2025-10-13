const fs = require('fs');
const path = require('path');

// Chemins vers les fichiers de traduction
const frPath = path.join(__dirname, '../public/locales/fr/common.json');
const enPath = path.join(__dirname, '../public/locales/en/common.json');

// Lire les fichiers de traduction existants
const frTranslations = JSON.parse(fs.readFileSync(frPath, 'utf8'));
const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));

console.log('🔍 Vérification des traductions...');

// Fonction pour vérifier récursivement les clés manquantes
function findMissingKeys(obj1, obj2, path = '') {
  const missing = [];
  
  for (const key in obj1) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (!(key in obj2)) {
      missing.push(currentPath);
    } else if (typeof obj1[key] === 'object' && obj1[key] !== null && !Array.isArray(obj1[key])) {
      missing.push(...findMissingKeys(obj1[key], obj2[key], currentPath));
    }
  }
  
  return missing;
}

// Vérifier les clés manquantes dans chaque direction
const missingInEn = findMissingKeys(frTranslations, enTranslations);
const missingInFr = findMissingKeys(enTranslations, frTranslations);

console.log(`❌ Clés manquantes en anglais: ${missingInEn.length}`);
missingInEn.forEach(key => console.log(`  - ${key}`));

console.log(`❌ Clés manquantes en français: ${missingInFr.length}`);
missingInFr.forEach(key => console.log(`  - ${key}`));

// Fonction pour définir une valeur dans un objet imbriqué
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

// Fonction pour obtenir une valeur dans un objet imbriqué
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}

// Ajouter les clés manquantes avec des traductions par défaut
console.log('\n🔧 Correction des traductions manquantes...');

// Traductions par défaut pour les clés communes
const defaultTranslations = {
  fr: {
    'footer.email': 'Email',
    'footer.phone': '+221 701 193 811',
    'testimonials.title': 'Témoignages Clients',
    'testimonials.description': 'Découvrez comment nos solutions ont transformé le business de nos clients au Sénégal et au Maroc.',
    'testimonials.average_rating': 'Note moyenne',
    'testimonials.satisfied_clients': 'Clients satisfaits',
    'testimonials.recommendations': 'Recommandations',
    'testimonials.support': 'Support disponible'
  },
  en: {
    'footer.email': 'Email',
    'footer.phone': '+221 701 193 811',
    'testimonials.title': 'Client Testimonials',
    'testimonials.description': 'Discover how our solutions have transformed our clients\' businesses in Senegal and Morocco.',
    'testimonials.average_rating': 'Average rating',
    'testimonials.satisfied_clients': 'Satisfied clients',
    'testimonials.recommendations': 'Recommendations',
    'testimonials.support': 'Support available'
  }
};

// Corriger les traductions françaises
missingInFr.forEach(key => {
  const englishValue = getNestedValue(enTranslations, key);
  const defaultValue = defaultTranslations.fr[key];
  
  if (defaultValue) {
    setNestedValue(frTranslations, key, defaultValue);
    console.log(`✅ Ajouté en français: ${key} = "${defaultValue}"`);
  } else if (englishValue) {
    setNestedValue(frTranslations, key, `[FR] ${englishValue}`);
    console.log(`⚠️  Ajouté en français (à traduire): ${key} = "[FR] ${englishValue}"`);
  }
});

// Corriger les traductions anglaises
missingInEn.forEach(key => {
  const frenchValue = getNestedValue(frTranslations, key);
  const defaultValue = defaultTranslations.en[key];
  
  if (defaultValue) {
    setNestedValue(enTranslations, key, defaultValue);
    console.log(`✅ Ajouté en anglais: ${key} = "${defaultValue}"`);
  } else if (frenchValue) {
    setNestedValue(enTranslations, key, `[EN] ${frenchValue}`);
    console.log(`⚠️  Ajouté en anglais (à traduire): ${key} = "[EN] ${frenchValue}"`);
  }
});

// Sauvegarder les fichiers corrigés
try {
  fs.writeFileSync(frPath, JSON.stringify(frTranslations, null, 2), 'utf8');
  fs.writeFileSync(enPath, JSON.stringify(enTranslations, null, 2), 'utf8');
  
  console.log('\n✅ Fichiers de traduction mis à jour avec succès!');
  console.log('📝 Note: Les traductions marquées [FR] ou [EN] doivent être traduites manuellement.');
  
} catch (error) {
  console.error('❌ Erreur lors de la sauvegarde:', error);
}

console.log('\n🎉 Correction terminée!');