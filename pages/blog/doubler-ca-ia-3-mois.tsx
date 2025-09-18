import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Header } from '../../src/components/Header';
import { Footer } from '../../src/components/Footer';
import { ArrowLeft, TrendingUp, Users, Zap, CheckCircle } from 'lucide-react';

export default function DoublerCAIA() {
  const handleCTA = () => {
    // Scroll to the contact form instead of opening WhatsApp
    const contactFormElement = document.getElementById('contact-form');
    if (contactFormElement) {
      contactFormElement.scrollIntoView({ behavior: 'smooth' });
      // Focus on the first input field
      const firstInput = contactFormElement.querySelector('input');
      if (firstInput) {
        firstInput.focus();
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Comment l'IA peut Doubler votre CA en 3 Mois | Guide Complet 2024 - OMA Digital</title>
        <meta name="description" content="Découvrez les 5 stratégies IA éprouvées qui ont permis à 200+ PME sénégalaises et marocaines de doubler leur chiffre d'affaires en moins de 3 mois. Guide pratique avec cas concrets." />
        <meta name="keywords" content="IA PME Sénégal, doubler chiffre affaires IA, automatisation business Dakar, intelligence artificielle Maroc, croissance PME IA, WhatsApp automatisation, chatbot ventes" />
        <link rel="canonical" href="https://oma-digital.sn/blog/doubler-ca-ia-3-mois" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Comment l'IA peut Doubler votre CA en 3 Mois | Guide Complet 2024" />
        <meta property="og:description" content="5 stratégies IA éprouvées pour doubler le CA de votre PME en 3 mois. 200+ entreprises transformées au Sénégal et Maroc." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://oma-digital.sn/blog/doubler-ca-ia-3-mois" />
        
        {/* Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Comment l'IA peut Doubler votre CA en 3 Mois",
            "author": {
              "@type": "Organization",
              "name": "OMA Digital"
            },
            "publisher": {
              "@type": "Organization",
              "name": "OMA Digital",
              "logo": "https://oma-digital.sn/images/logo.webp"
            },
            "datePublished": "2024-01-15",
            "dateModified": "2024-01-15",
            "description": "Guide complet pour doubler le chiffre d'affaires avec l'IA en 3 mois"
          })
        }} />
      </Head>

      <Header />
      
      <main className="pt-16 md:pt-20">
        {/* Hero Article */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 relative overflow-hidden">
          {/* Image d'illustration */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-16 h-16 text-white" />
            </div>
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
              <Zap className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link href="/blog" className="inline-flex items-center text-blue-200 hover:text-white mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au blog
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Comment l'IA peut Doubler votre CA en 3 Mois
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Les 5 stratégies éprouvées qui ont transformé 200+ PME au Sénégal et au Maroc
            </p>
            
            <div className="flex items-center space-x-6 text-sm">
              <span>📅 15 janvier 2024</span>
              <span>⏱️ 8 min de lecture</span>
              <span>👥 200+ PME transformées</span>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Introduction */}
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              <strong>Imaginez doubler votre chiffre d'affaires en seulement 3 mois.</strong> C'est exactement ce qu'ont réalisé Amadou Diop (boulangerie à Dakar), Fatima El Mansouri (boutique à Casablanca) et 200+ autres entrepreneurs grâce à l'Intelligence Artificielle.
            </p>

            <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
              <h3 className="text-lg font-bold text-green-800 mb-2">🎯 Résultats Garantis</h3>
              <p className="text-green-700">
                En appliquant ces 5 stratégies, nos clients obtiennent en moyenne <strong>+247% de CA en 90 jours</strong>. 
                Si vous n'obtenez pas de résultats, nous vous remboursons 200%.
              </p>
            </div>

            {/* Stratégie 1 */}
            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6 flex items-center">
              <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">1</span>
              Automatisation WhatsApp : Votre Vendeur 24/7
            </h2>

            <p className="mb-6">
              <strong>Le problème :</strong> Vous perdez 70% de vos prospects parce que vous ne répondez pas assez vite sur WhatsApp.
            </p>

            <p className="mb-6">
              <strong>La solution IA :</strong> Un chatbot intelligent qui répond instantanément, qualifie vos prospects et prend les commandes même quand vous dormez.
            </p>

            <div className="bg-blue-50 p-6 rounded-lg mb-8 relative overflow-hidden">
              <div className="absolute top-2 right-2 w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center opacity-50">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-bold text-blue-800 mb-3">📊 Cas Concret : Amadou Diop - Boulangerie Liberté (Dakar)</h4>
              <ul className="text-blue-700 space-y-2">
                <li>• <strong>Avant :</strong> 50 commandes/jour, réponse en 2h moyenne</li>
                <li>• <strong>Après :</strong> 180 commandes/jour, réponse instantanée</li>
                <li>• <strong>Résultat :</strong> +260% de CA en 2 mois</li>
              </ul>
            </div>

            {/* Stratégie 2 */}
            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6 flex items-center">
              <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">2</span>
              Site Ultra-Rapide : Convertir Chaque Visiteur
            </h2>

            <p className="mb-6">
              <strong>Fait choquant :</strong> 53% des visiteurs quittent un site qui met plus de 3 secondes à charger. 
              Au Sénégal et au Maroc, avec les connexions parfois lentes, c'est encore pire.
            </p>

            <p className="mb-6">
              <strong>Notre solution :</strong> Sites optimisés IA qui chargent en moins de 1.5 seconde et convertissent 3x mieux.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-bold text-red-800 mb-2">❌ Site Classique</h4>
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• Chargement : 5-8 secondes</li>
                  <li>• Taux de conversion : 1-2%</li>
                  <li>• Taux de rebond : 70%</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-800 mb-2">✅ Site OMA Digital</h4>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• Chargement : &lt;1.5 seconde</li>
                  <li>• Taux de conversion : 6-8%</li>
                  <li>• Taux de rebond : 25%</li>
                </ul>
              </div>
            </div>

            {/* Stratégie 3 */}
            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6 flex items-center">
              <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">3</span>
              IA Prédictive : Anticiper les Besoins Clients
            </h2>

            <p className="mb-6">
              L'IA analyse le comportement de vos clients et prédit leurs prochains achats. 
              Résultat : vous proposez le bon produit au bon moment.
            </p>

            <div className="bg-purple-50 p-6 rounded-lg mb-8 relative overflow-hidden">
              <div className="absolute top-2 right-2 w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center opacity-60">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-bold text-purple-800 mb-3">🎯 Exemple Concret</h4>
              <p className="text-purple-700">
                Un client achète du pain le matin ? L'IA lui propose automatiquement des viennoiseries. 
                Taux d'achat additionnel : <strong>+85%</strong>
              </p>
            </div>

            {/* Stratégie 4 */}
            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6 flex items-center">
              <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">4</span>
              Marketing Automation : Fidéliser Sans Effort
            </h2>

            <p className="mb-6">
              L'IA envoie automatiquement les bons messages aux bons clients au bon moment. 
              Fini les campagnes marketing qui tombent à plat.
            </p>

            <div className="bg-yellow-50 p-6 rounded-lg mb-8 relative overflow-hidden">
              <div className="absolute top-2 right-2 w-14 h-14 bg-yellow-200 rounded-full flex items-center justify-center opacity-50">
                <Users className="w-7 h-7 text-yellow-600" />
              </div>
              <h4 className="font-bold text-yellow-800 mb-3">📈 Résultats Typiques</h4>
              <ul className="text-yellow-700 space-y-2">
                <li>• Taux d'ouverture email : +340%</li>
                <li>• Taux de clic : +180%</li>
                <li>• Ventes répétées : +220%</li>
              </ul>
            </div>

            {/* Stratégie 5 */}
            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6 flex items-center">
              <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">5</span>
              Analytics IA : Décisions Basées sur la Data
            </h2>

            <p className="mb-6">
              Plus de décisions au feeling. L'IA vous dit exactement quoi faire pour maximiser vos profits.
            </p>

            {/* Témoignages */}
            <div className="bg-gray-50 p-8 rounded-xl mt-12 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                🗣️ Ce que disent nos clients
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      A
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold">Amadou Diop</h4>
                      <p className="text-sm text-gray-600">Boulangerie Liberté, Dakar</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "En 2 mois, j'ai triplé mon CA. L'IA gère mes commandes WhatsApp 24/7. 
                    Je me concentre enfin sur la qualité de mes produits."
                  </p>
                  <div className="mt-4 text-green-600 font-bold">+260% de CA</div>
                </div>

                <div className="bg-white p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      F
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold">Fatima El Mansouri</h4>
                      <p className="text-sm text-gray-600">Boutique Moderne, Casablanca</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "Mon site charge maintenant en 1 seconde. Mes ventes en ligne ont explosé. 
                    L'IA recommande les bons produits à mes clients."
                  </p>
                  <div className="mt-4 text-green-600 font-bold">+180% de ventes en ligne</div>
                </div>
              </div>
            </div>

            {/* Plan d'action */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-8 rounded-xl mt-12">
              <h3 className="text-2xl font-bold mb-6 text-center">
                🚀 Votre Plan d'Action en 3 Étapes
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white text-orange-500 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                    1
                  </div>
                  <h4 className="font-bold mb-2">Audit Gratuit</h4>
                  <p className="text-sm text-orange-100">
                    Nous analysons votre business et identifions les opportunités IA
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-white text-orange-500 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                    2
                  </div>
                  <h4 className="font-bold mb-2">Implémentation</h4>
                  <p className="text-sm text-orange-100">
                    Nous mettons en place les solutions IA en 48h maximum
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-white text-orange-500 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                    3
                  </div>
                  <h4 className="font-bold mb-2">Résultats</h4>
                  <p className="text-sm text-orange-100">
                    Vous voyez vos ventes doubler en moins de 3 mois
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* CTA Final */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Prêt à Doubler Votre CA avec l'IA ?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Rejoignez les 200+ PME qui ont transformé leur business. 
              Découverte de votre potentiel + stratégie personnalisée
            </p>
            
            <div className="space-y-4">
              <button
                onClick={handleCTA}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors inline-flex items-center space-x-2"
              >
                <span>💬</span>
                <span>Obtenir Mon Audit Gratuit Maintenant</span>
              </button>
              
              <p className="text-sm text-gray-500">
                🔒 Sans engagement • ⚡ Réponse sous 2h • 🇸🇳🇲🇦 Équipe locale
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}