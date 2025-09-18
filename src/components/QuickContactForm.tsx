import { useState } from 'react';
import { Send, Phone } from 'lucide-react';

export default function QuickContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: 'whatsapp'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track conversion
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'form_submit', {
        event_category: 'engagement',
        event_label: 'quick_contact'
      });
    }

    // Send to WhatsApp
    const message = `Bonjour ! Je suis ${formData.name}, je souhaite des infos sur ${formData.service}. Mon numéro: ${formData.phone}`;
    const whatsappUrl = `https://wa.me/212701193811?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Devis Gratuit en 24h
        </h3>
        <p className="text-gray-600">3 infos = réponse personnalisée</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Votre nom"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          required
        />
        
        <input
          type="tel"
          placeholder="Votre WhatsApp"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          required
        />
        
        <select
          value={formData.service}
          onChange={(e) => setFormData({...formData, service: e.target.value})}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="whatsapp">Automatisation WhatsApp</option>
          <option value="website">Site Web Ultra-Rapide</option>
          <option value="app">Application Mobile</option>
          <option value="ai">Assistant IA</option>
        </select>

        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 flex items-center justify-center space-x-2"
        >
          <Send className="w-5 h-5" />
          <span>Recevoir mon devis</span>
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          ✅ Réponse garantie en 24h • ✅ Audit gratuit inclus
        </p>
      </div>
    </div>
  );
}