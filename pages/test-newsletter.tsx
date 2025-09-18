/**
 * Page de test pour la newsletter
 */

import React from 'react';
import { Toaster } from 'react-hot-toast';
import NewsletterSubscription from '../components/Newsletter/NewsletterSubscription';

export default function TestNewsletter() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 Test Newsletter OMA Digital
          </h1>
          <p className="text-xl text-gray-600">
            Testez l'inscription à la newsletter et vérifiez la connexion Supabase
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Variant par défaut */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Variant par défaut</h2>
            <NewsletterSubscription />
          </div>

          {/* Variant compact */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Variant compact</h2>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Newsletter OMA Digital</h3>
              <NewsletterSubscription variant="compact" />
            </div>
          </div>

          {/* Variant footer */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Variant footer</h2>
            <div className="bg-gray-800 text-white rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Restez connecté</h3>
              <p className="text-gray-300 mb-4">
                Recevez nos dernières actualités et conseils
              </p>
              <NewsletterSubscription variant="footer" className="max-w-md" />
            </div>
          </div>
        </div>

        {/* Informations techniques */}
        <div className="mt-12 bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-4">📊 Informations Newsletter</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">✅ API Endpoints</h3>
              <ul className="space-y-2 text-sm">
                <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/subscribe-newsletter</code></li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/confirm-subscription?token=xxx</code></li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/unsubscribe-newsletter?token=xxx</code></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">🔗 Table Supabase</h3>
              <ul className="space-y-1 text-sm">
                <li>📋 Table: <code className="bg-gray-100 px-2 py-1 rounded">blog_subscribers</code></li>
                <li>📧 Champs: email, name, status, tokens</li>
                <li>🔄 Statuts: pending → active</li>
                <li>✉️ Emails de confirmation automatiques</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">🧪 Test Instructions</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
              <li>Utilisez une adresse email de test (ex: test@example.com)</li>
              <li>Remplissez le formulaire et cliquez sur "S'abonner"</li>
              <li>Vérifiez les logs du serveur pour voir l'insertion Supabase</li>
              <li>Allez sur l'admin dashboard pour voir les nouveaux abonnés</li>
              <li>Testez le lien de confirmation reçu par email</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}