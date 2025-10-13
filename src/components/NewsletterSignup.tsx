import React, { useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from '../lib/env-public';

// Initialize Supabase client with optimized settings
const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }
});

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Veuillez entrer une adresse email valide.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/subscribe-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'newsletter_popup'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Merci pour votre inscription à notre newsletter !');
        setEmail('');
      } else {
        toast.error(data.error || 'Erreur lors de l\'inscription.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 md:mt-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 md:p-10 text-center text-white shadow-2xl">
      <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
        🎯 Newsletter Secrète IA
      </h3>
      <p className="text-base md:text-lg mb-5 md:mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
        Recevez chaque semaine nos stratégies IA exclusives, cas d'études avec ROI détaillé et templates gratuits pour PME
      </p>
      
      {/* Stats Newsletter */}
      <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 mb-4 md:mb-6 text-xs md:text-sm">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span>2,847 abonnés</span>
        </div>
        <div className="flex items-center gap-1">
          <span>⭐</span>
          <span>4.9/5 (156 avis)</span>
        </div>
        <div className="flex items-center gap-1">
          <span>📈</span>
          <span>+300% ROI moyen</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-2xl mx-auto">
        <div className="flex-1 relative">
          <input
            type="email"
            placeholder="Votre email professionnel..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 md:px-6 md:py-4 rounded-xl text-gray-900 placeholder-gray-500 border-2 border-transparent focus:border-white focus:ring-2 focus:ring-white/20 transition-all text-sm md:text-base font-medium min-h-[56px]"
            required
            disabled={isSubmitting}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <span className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold">
              GRATUIT
            </span>
          </div>
        </div>
        
        <button 
          type="submit"
          className="bg-white text-orange-600 px-6 py-3 md:px-8 md:py-4 rounded-xl font-black text-sm md:text-base hover:bg-gray-100 hover:scale-105 transition-all duration-300 disabled:opacity-75 flex items-center justify-center shadow-lg min-w-[120px] md:min-w-[160px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>S'ABONNER</span>
              <span className="ml-2">🚀</span>
            </>
          )}
        </button>
      </form>
      
      {/* Garanties */}
      <div className="mt-4 md:mt-6 flex flex-wrap justify-center items-center gap-4 md:gap-8 text-xs md:text-sm opacity-90">
        <span className="flex items-center gap-1">
          <span>✅</span>
          <span>Désabonnement en 1 clic</span>
        </span>
        <span className="flex items-center gap-1">
          <span>🔒</span>
          <span>Données protégées</span>
        </span>
        <span className="flex items-center gap-1">
          <span>📧</span>
          <span>1 email/semaine max</span>
        </span>
      </div>
    </div>
  );
}