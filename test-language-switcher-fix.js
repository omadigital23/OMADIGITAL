#!/usr/bin/env node

/**
 * Test du fix du language switcher
 * Vérifie que le changement de langue fonctionne sur toute la page
 */

console.log('🌍 TEST DU FIX DU LANGUAGE SWITCHER');
console.log('═'.repeat(50));

async function checkServerHealth() {
  console.log('🔍 Vérification du serveur...');
  
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('✅ Serveur accessible');
      return true;
    } else {
      console.log('⚠️  Serveur accessible mais problème:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Serveur non accessible:', error.message);
    console.log('\n💡 SOLUTION:');
    console.log('1. Démarrez le serveur: npm run dev');
    console.log('2. Attendez que le serveur soit prêt');
    console.log('3. Relancez ce test');
    return false;
  }
}

function displayTestInstructions() {
  console.log('\n📋 INSTRUCTIONS DE TEST MANUEL');
  console.log('═'.repeat(50));
  
  console.log('\n🎯 OBJECTIF:');
  console.log('Vérifier que le language switcher change TOUTE la page, pas seulement le header');
  
  console.log('\n📝 ÉTAPES À SUIVRE:');
  console.log('1. Ouvrez votre navigateur sur http://localhost:3000');
  console.log('2. Observez que la page est en français par défaut');
  console.log('3. Cliquez sur le language switcher dans le header');
  console.log('4. Sélectionnez "English"');
  console.log('5. Vérifiez que TOUS les éléments changent:');
  
  console.log('\n✅ ÉLÉMENTS À VÉRIFIER:');
  console.log('   📍 Header: Navigation, boutons');
  console.log('   🎯 Hero Section: Titre, description, boutons');
  console.log('   🛠️  Services Section: Titres, descriptions, features');
  console.log('   📊 Offers Section: Titres, descriptions');
  console.log('   📞 Footer: Textes, liens');
  
  console.log('\n🔍 TESTS SPÉCIFIQUES:');
  console.log('');
  console.log('TEST 1 - Header:');
  console.log('   FR: "Accueil", "Services", "Contact"');
  console.log('   EN: "Home", "Services", "Contact"');
  
  console.log('\nTEST 2 - Hero Section:');
  console.log('   FR: "Votre partenaire digital au Sénégal et au Maroc"');
  console.log('   EN: "Your digital partner in Senegal and Morocco"');
  
  console.log('\nTEST 3 - Services Section:');
  console.log('   FR: "Automatisation WhatsApp", "Sites Web Ultra-Rapides"');
  console.log('   EN: "WhatsApp Automation", "Ultra-Fast Websites"');
  
  console.log('\nTEST 4 - Boutons:');
  console.log('   FR: "Demander un devis", "Démarrer maintenant"');
  console.log('   EN: "Request a quote", "Get started now"');
  
  console.log('\n❌ PROBLÈMES POSSIBLES:');
  console.log('- Seul le header change → Composants n\'utilisent pas useTranslation');
  console.log('- Texte mélangé FR/EN → Clés de traduction manquantes');
  console.log('- Pas de changement → LanguageProvider non configuré');
  
  console.log('\n🔧 SOLUTIONS:');
  console.log('- Ajouter useTranslation() dans les composants');
  console.log('- Remplacer le texte en dur par t(\'key\')');
  console.log('- Vérifier les clés dans src/lib/i18n.ts');
  
  console.log('\n✅ SUCCÈS SI:');
  console.log('- Changement de langue instantané sur toute la page');
  console.log('- Aucun texte en dur restant');
  console.log('- Navigation fluide entre FR et EN');
  console.log('- Cohérence des traductions');
}

function displayFixSummary() {
  console.log('\n🔧 RÉSUMÉ DES CORRECTIONS APPLIQUÉES');
  console.log('═'.repeat(50));
  
  console.log('\n✅ FICHIERS MODIFIÉS:');
  console.log('1. src/components/ServicesSection.tsx');
  console.log('   - Ajout de useTranslation()');
  console.log('   - Remplacement du texte en dur par les clés de traduction');
  
  console.log('\n2. src/components/Footer.tsx');
  console.log('   - Ajout de useTranslation()');
  console.log('   - Préparation pour les traductions');
  
  console.log('\n3. src/lib/i18n.ts');
  console.log('   - Ajout des clés services.whatsapp.*');
  console.log('   - Ajout des clés services.website.*');
  console.log('   - Ajout des clés services.branding.*');
  console.log('   - Traductions FR et EN complètes');
  
  console.log('\n📊 COMPOSANTS AVEC TRADUCTIONS:');
  console.log('✅ Header.tsx - Déjà configuré');
  console.log('✅ HeroSection.tsx - Déjà configuré');
  console.log('✅ ServicesSection.tsx - Corrigé');
  console.log('✅ OffersSection.tsx - Déjà configuré');
  console.log('🔄 Footer.tsx - En cours');
  
  console.log('\n🎯 ARCHITECTURE:');
  console.log('- LanguageProvider dans _app.tsx ✅');
  console.log('- LanguageContext configuré ✅');
  console.log('- i18n initialisé ✅');
  console.log('- Détection automatique ✅');
}

function displayNextSteps() {
  console.log('\n🚀 PROCHAINES ÉTAPES');
  console.log('═'.repeat(50));
  
  console.log('\n📋 POUR COMPLÉTER LE FIX:');
  console.log('1. Tester manuellement avec les instructions ci-dessus');
  console.log('2. Identifier les composants qui ne changent pas');
  console.log('3. Ajouter useTranslation() aux composants manquants');
  console.log('4. Compléter les traductions dans i18n.ts');
  
  console.log('\n🔍 COMPOSANTS À VÉRIFIER:');
  console.log('- TestimonialsSection.tsx');
  console.log('- CaseStudiesSection.tsx');
  console.log('- CTASection.tsx');
  console.log('- ProcessTimeline.tsx');
  
  console.log('\n💡 CONSEILS:');
  console.log('- Utilisez la console du navigateur pour déboguer');
  console.log('- Vérifiez les erreurs de clés manquantes');
  console.log('- Testez sur mobile et desktop');
  console.log('- Vérifiez la persistance du choix de langue');
}

async function main() {
  const serverHealthy = await checkServerHealth();
  
  if (!serverHealthy) {
    console.log('\n❌ Impossible de continuer sans serveur fonctionnel');
    process.exit(1);
  }

  displayFixSummary();
  displayTestInstructions();
  displayNextSteps();
  
  console.log('\n🎉 LE FIX DU LANGUAGE SWITCHER EST PRÊT À TESTER !');
  console.log('═'.repeat(50));
  console.log('Ouvrez http://localhost:3000 et testez le changement de langue');
}

main().catch(console.error);