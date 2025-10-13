const fs = require('fs');
const path = require('path');

// Read the i18n.ts file
const i18nContent = fs.readFileSync(path.join(__dirname, '..', 'src', 'lib', 'i18n.ts'), 'utf8');

// Extract French translations
const frMatch = i18nContent.match(/const frTranslations = \{[\s\S]*?translation: (\{[\s\S]*?\n  \}\n)\};/);
const frTranslationsStr = frMatch ? frMatch[1] : '{}';

// Extract English translations  
const enMatch = i18nContent.match(/const enTranslations = \{[\s\S]*?translation: (\{[\s\S]*?\n  \}\n)\};/);
const enTranslationsStr = enMatch ? enMatch[1] : '{}';

// Convert to proper JSON by evaluating the object
const evalTranslations = (str) => {
  try {
    // Replace single quotes with double quotes for JSON
    let jsonStr = str
      .replace(/'/g, '"')
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/(\w+):/g, '"$1":'); // Quote keys
    
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Error parsing translations:', e);
    // Fallback: use eval (not recommended for production, but works for build scripts)
    return eval('(' + str + ')');
  }
};

const frTranslations = evalTranslations(frTranslationsStr);
const enTranslations = evalTranslations(enTranslationsStr);

// Create locale directories
const localesDir = path.join(__dirname, '..', 'public', 'locales');
const frDir = path.join(localesDir, 'fr');
const enDir = path.join(localesDir, 'en');

[frDir, enDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Write common.json files
fs.writeFileSync(
  path.join(frDir, 'common.json'),
  JSON.stringify(frTranslations, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(enDir, 'common.json'),
  JSON.stringify(enTranslations, null, 2),
  'utf8'
);

console.log('✅ Translation files created successfully!');
console.log('  - public/locales/fr/common.json');
console.log('  - public/locales/en/common.json');
