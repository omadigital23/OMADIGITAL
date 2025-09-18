/**
 * Composant d'inscription à la newsletter
 */

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface NewsletterSubscriptionProps {
  className?: string;
  variant?: 'default' | 'compact' | 'footer';
}

export default function NewsletterSubscription({ 
  className = '', 
  variant = 'default' 
}: NewsletterSubscriptionProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Veuillez saisir votre adresse email');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/subscribe-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSubscribed(true);
        setEmail('');
        setName('');
        toast.success(result.message || 'Inscription réussie ! Vérifiez votre email.');
      } else {
        toast.error(result.error || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Inscription réussie !
            </h3>
            <div className="mt-1 text-sm text-green-700">
              Vérifiez votre email pour confirmer votre inscription.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Variant compact pour footer
  if (variant === 'compact' || variant === 'footer') {
    return (
      <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
        <div>
          <label htmlFor="newsletter-email" className="sr-only">
            Adresse email
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="Votre adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={isLoading}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Inscription...' : 'S\'abonner'}
        </button>
      </form>
    );
  }

  // Variant par défaut
  return (
    <div className={`bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          📧 Restez informé !
        </h3>
        <p className="text-gray-600">
          Recevez nos conseils exclusifs sur l'IA et la transformation digitale pour PME
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nom (optionnel)
          </label>
          <input
            id="name"
            type="text"
            placeholder="Votre nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Adresse email *
          </label>
          <input
            id="email"
            type="email"
            placeholder="votre.email@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Inscription en cours...
            </>
          ) : (
            '🚀 Rejoindre la communauté'
          )}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        En vous inscrivant, vous acceptez de recevoir nos emails. 
        <br />
        Vous pouvez vous désabonner à tout moment.
      </div>
    </div>
  );
}