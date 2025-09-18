import React, { useState, useEffect } from 'react';
import { Send, Phone, Mail, MapPin, Clock, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { useABTest, useRecordConversion } from '../hooks/useABTest';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ChatMessage } from './SmartChatbot/types'; // Import ChatMessage type

// Configuration Supabase - Using the same configuration as in info.tsx
const supabaseUrl = typeof window !== 'undefined' ? `https://${projectId}.supabase.co` : process.env.NEXT_PUBLIC_SUPABASE_URL || `https://${projectId}.supabase.co`;
const supabaseKey = typeof window !== 'undefined' ? publicAnonKey : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || publicAnonKey;

// Only create Supabase client if we have the required config
let supabase: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
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
}

// Define suggestion interface
interface FormSuggestion {
  id: string;
  text: string;
  icon: string;
  field: 'message' | 'service' | 'budget' | 'company';
  value: string;
}

export function CTASection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: '',
    budget: '',
    location: 'senegal' // New field for location selection
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [suggestions, setSuggestions] = useState<FormSuggestion[]>([]); // New state for suggestions
  const [errors, setErrors] = useState<string[]>([]); // State for validation errors
  
  // A/B Testing hooks
  const contactFormVariant = useABTest('contact_form');
  const recordConversion = useRecordConversion('contact_form', contactFormVariant);

  const services = [
    'Automatisation WhatsApp',
    'Site Web Ultra-Rapide',
    'Branding Complet',
    'Dashboard Analytics',
    'Assistant IA',
    'Sécurité & Conformité',
    'Application Mobile PWA',
    'Consultation Stratégique'
  ];

  const budgetRanges = [
    'Moins de 500.000 CFA',
    '500.000 - 1.000.000 CFA',
    '1.000.000 - 2.000.000 CFA',
    '2.000.000 - 5.000.000 CFA',
    'Plus de 5.000.000 CFA'
  ];

  // Generate smart suggestions based on form input
  const generateSuggestions = (field: string, value: string) => {
    const lowerValue = value.toLowerCase();
    const newSuggestions: FormSuggestion[] = [];
    
    // Suggestions for message field
    if (field === 'message') {
      if (lowerValue.includes('whatsapp') || lowerValue.includes('message') || lowerValue.includes('communication')) {
        newSuggestions.push({
          id: 'msg-wa-1',
          text: 'Automatiser mes communications WhatsApp',
          icon: '📱',
          field: 'message',
          value: 'Je souhaite automatiser mes communications WhatsApp pour améliorer mon service client et gagner du temps'
        });
        newSuggestions.push({
          id: 'msg-wa-2',
          text: 'Créer un chatbot WhatsApp',
          icon: '🤖',
          field: 'message',
          value: 'Je veux créer un chatbot WhatsApp pour répondre automatiquement aux questions fréquentes de mes clients'
        });
      }
      
      if (lowerValue.includes('site') || lowerValue.includes('web') || lowerValue.includes('internet')) {
        newSuggestions.push({
          id: 'msg-web-1',
          text: 'Site web ultra-rapide pour mon entreprise',
          icon: '⚡',
          field: 'message',
          value: 'Je veux un site web ultra-rapide pour améliorer ma visibilité en ligne et attirer plus de clients'
        });
        newSuggestions.push({
          id: 'msg-web-2',
          text: 'Site e-commerce',
          icon: '🛒',
          field: 'message',
          value: 'Je souhaite créer une boutique en ligne pour vendre mes produits 24h/24'
        });
      }
      
      if (lowerValue.includes('brand') || lowerValue.includes('marque') || lowerValue.includes('identité')) {
        newSuggestions.push({
          id: 'msg-brand-1',
          text: 'Développer mon identité de marque',
          icon: '🎨',
          field: 'message',
          value: 'Je veux développer une identité de marque forte pour me démarquer de mes concurrents'
        });
      }
      
      if (lowerValue.includes('analyse') || lowerValue.includes('dashboard') || lowerValue.includes('data')) {
        newSuggestions.push({
          id: 'msg-data-1',
          text: 'Tableau de bord pour suivre mes KPIs',
          icon: '📊',
          field: 'message',
          value: 'J\'ai besoin d\'un tableau de bord pour suivre mes indicateurs de performance et prendre de meilleures décisions'
        });
      }
      
      if (lowerValue.includes('ia') || lowerValue.includes('intelligence') || lowerValue.includes('automatisation')) {
        newSuggestions.push({
          id: 'msg-ia-1',
          text: 'Assistant IA pour mon entreprise',
          icon: '🧠',
          field: 'message',
          value: 'Je veux un assistant IA pour automatiser certaines tâches et améliorer mon efficacité'
        });
      }
    }
    
    // Suggestions for service field
    if (field === 'service') {
      services.forEach((service, index) => {
        if (service.toLowerCase().includes(lowerValue) && lowerValue.length > 2) {
          newSuggestions.push({
            id: `service-${index}`,
            text: service,
            icon: '🔧',
            field: 'service',
            value: service
          });
        }
      });
    }
    
    // Suggestions for company field
    if (field === 'company' && value.length > 0 && value.length < 3) {
      newSuggestions.push({
        id: 'company-1',
        text: 'Je suis un particulier',
        icon: '👤',
        field: 'company',
        value: 'Particulier'
      });
      newSuggestions.push({
        id: 'company-2',
        text: 'Auto-entrepreneur',
        icon: '👨‍💼',
        field: 'company',
        value: 'Auto-entrepreneur'
      });
    }
    
    setSuggestions(newSuggestions);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: FormSuggestion) => {
    setFormData({
      ...formData,
      [suggestion.field]: suggestion.value
    });
    setSuggestions([]); // Clear suggestions after selection
  };

  // Handle input changes and generate suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Generate suggestions for specific fields
    if (name === 'message' || name === 'service' || name === 'company') {
      generateSuggestions(name, value);
    } else {
      // Clear suggestions for other fields
      setSuggestions([]);
    }
  };

  // Clear suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setSuggestions([]);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if Supabase is configured
    if (!supabase) {
      console.error('Supabase is not configured properly');
      setSubmitStatus('error');
      setErrors(['Service temporarily unavailable. Please try again later.']);
      return;
    }
    
    // Enhanced security validation using SecurityManager
    const { securityManager } = await import('../lib/security-enhanced');
    const errors: string[] = [];
    
    // Validate and sanitize name
    const nameValidation = securityManager.validateAndSanitize(formData.name, 'form');
    if (!nameValidation.isValid) {
      errors.push("Le nom contient des caractères non autorisés");
    } else if (!nameValidation.sanitized.trim()) {
      errors.push("Le nom complet est requis");
    } else if (nameValidation.sanitized.trim().length < 2) {
      errors.push("Le nom doit contenir au moins 2 caractères");
    } else if (nameValidation.sanitized.trim().length > 50) {
      errors.push("Le nom ne doit pas dépasser 50 caractères");
    } else {
      formData.name = nameValidation.sanitized;
    }
    
    // Validate email with enhanced security
    const emailValidation = securityManager.validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.threats.map(threat => 
        threat === 'Invalid email format' ? "Veuillez entrer une adresse email valide" : "Email contient du contenu suspect"
      ));
    } else {
      formData.email = emailValidation.sanitized;
    }
    
    // Validate phone with enhanced security
    const phoneValidation = securityManager.validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      errors.push(...phoneValidation.threats.map(threat => 
        threat.includes('Invalid phone format') ? "Veuillez entrer un numéro de téléphone valide (Sénégal ou Maroc)" : "Numéro de téléphone contient des caractères non autorisés"
      ));
    } else {
      formData.phone = phoneValidation.sanitized;
    }
    
    // Validate and sanitize company (optional)
    if (formData.company) {
      const companyValidation = securityManager.validateAndSanitize(formData.company, 'form');
      if (!companyValidation.isValid) {
        errors.push("Le nom de l'entreprise contient des caractères non autorisés");
      } else if (companyValidation.sanitized.length > 100) {
        errors.push("Le nom de l'entreprise ne doit pas dépasser 100 caractères");
      } else {
        formData.company = companyValidation.sanitized;
      }
    }
    
    // Validate service (whitelist check)
    if (!formData.service) {
      errors.push("Veuillez sélectionner un service d'intérêt");
    } else if (!services.includes(formData.service)) {
      errors.push("Service sélectionné non valide");
    }
    
    // Validate and sanitize message
    const messageValidation = securityManager.validateAndSanitize(formData.message, 'form');
    if (!messageValidation.isValid) {
      errors.push("Le message contient du contenu non autorisé");
      if (messageValidation.riskLevel === 'critical' || messageValidation.riskLevel === 'high') {
        // Log security incident
        console.warn('High-risk content detected in form:', {
          threats: messageValidation.threats,
          riskLevel: messageValidation.riskLevel
        });
      }
    } else if (!messageValidation.sanitized.trim()) {
      errors.push("Veuillez décrire votre projet");
    } else if (messageValidation.sanitized.trim().length < 10) {
      errors.push("Votre description de projet doit contenir au moins 10 caractères");
    } else if (messageValidation.sanitized.trim().length > 1000) {
      errors.push("Votre description de projet ne doit pas dépasser 1000 caractères");
    } else {
      formData.message = messageValidation.sanitized;
    }
    
    // Validate budget (whitelist check)
    if (formData.budget && !budgetRanges.includes(formData.budget)) {
      errors.push("Veuillez sélectionner une tranche de budget valide");
    }
    
    // Validate location (whitelist check)
    if (!['senegal', 'morocco'].includes(formData.location)) {
      errors.push("Veuillez sélectionner une localisation valide");
    }
    
    // If there are validation errors, display them
    if (errors.length > 0) {
      setErrors(errors);
      setSubmitStatus('error');
      // We'll display these errors in the UI instead of trying to use chat state
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // All data is now sanitized and validated
      // Envoyer les données à Supabase
      const { data, error } = await supabase
        .from('quotes')
        .insert({
          name: formData.name, // Already sanitized
          email: formData.email, // Already sanitized
          phone: formData.phone, // Already sanitized
          company: formData.company || null, // Already sanitized
          service: formData.service, // Validated against whitelist
          message: formData.message, // Already sanitized
          budget: formData.budget || null, // Validated against whitelist
          location: formData.location, // Validated against whitelist
          status: 'nouveau',
          security_validated: true, // Mark as security validated
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Erreur Supabase:', error);
        throw new Error(`Erreur base de données: ${error.message}`);
      }

      console.log('✅ Devis enregistré avec succès:', data);
      setSubmitStatus('success');
      setErrors([]); // Clear errors on success
      
      // Réinitialiser le formulaire
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: '',
        message: '',
        budget: '',
        location: 'senegal'
      });
      
      // Clear suggestions
      setSuggestions([]);
      
      // Record conversion for A/B test
      await recordConversion();
      
      // Envoyer aussi un événement analytics avec données sécurisées
      try {
        await supabase
          .from('analytics_events')
          .insert({
            event_name: 'quote_form_submitted',
            event_data: {
              service: formData.service,
              budget: formData.budget,
              company: formData.company ? 'provided' : 'not_provided', // Don't store actual company name
              location: formData.location,
              form_variant: contactFormVariant,
              security_validated: true
            },
            page_url: typeof window !== 'undefined' ? window.location.pathname : '/contact',
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent?.substring(0, 200) : null,
            created_at: new Date().toISOString()
          });
      } catch (analyticsError) {
        console.warn('Erreur analytics (non critique):', analyticsError);
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSubmitStatus('idle');
        setErrors([]); // Clear errors when resetting status
      }, 5000);
    }
  };

  const contactInfo = [
    // Prioritized order: Form, Email, WhatsApp, Phone
    {
      icon: Send,
      title: "Formulaire de Contact",
      value: "Remplissez notre formulaire en ligne",
      link: null // Will scroll to the form
    },
    {
      icon: Mail,
      title: "Email",
      value: "omadigital23@gmail.com",
      link: "mailto:omadigital23@gmail.com"
    },
    {
      icon: Phone,
      title: "WhatsApp",
      value: "+221 701 193 811",
      link: "https://wa.me/221701193811"
    },
    {
      icon: Phone,
      title: "Téléphone",
      value: "+221 701 193 811",
      link: "tel:+221701193811"
    },
    {
      icon: MapPin,
      title: "Bureau Sénégal",
      value: "Hersent Rue 15, Thies, Sénégal",
      link: "https://maps.google.com/?q=Hersent+Rue+15+Thies+Senegal"
    },
    {
      icon: MapPin,
      title: "Bureau Maroc",
      value: "Moustakbal/Sidimaarouf Casablanca, Imm 167 Lot GH20 apt 15, Maroc",
      link: "https://maps.google.com/?q=Moustakbal+Sidimaarouf+Casablanca+Maroc"
    },
    {
      icon: Clock,
      title: "Horaires",
      value: "Lun-Ven: 8h-18h | Sam: 9h-13h",
      link: null
    }
  ];

  return (
    <section id="contact" className="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Prêt à Transformer Votre PME au Sénégal ou au Maroc ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Remplissez notre formulaire pour une consultation gratuite et un devis personnalisé en 24h. 
            Nous vous recontacterons rapidement pour discuter de votre projet !
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div id="contact-form" className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Demander un Devis Gratuit
            </h3>
            
            {submitStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800">Merci ! Nous vous recontactons sous 24h.</span>
              </div>
            )}
            
            {submitStatus === 'error' && (
              errors.length > 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span className="text-red-800 font-medium">Veuillez corriger les erreurs suivantes :</span>
                  </div>
                  <ul className="list-disc list-inside text-red-700 text-sm space-y-1 ml-8">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800">Erreur lors de l'envoi. Veuillez réessayer.</span>
                </div>
              )
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Votre nom complet"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email professionnel *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="+221 XX XXX XX XX"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Nom de votre entreprise"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service d'intérêt *
                  </label>
                  <select
                    name="service"
                    required
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Choisir un service</option>
                    {services.map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget estimé
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un budget</option>
                    {budgetRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, location: 'senegal'})}
                    className={`px-4 py-3 rounded-lg border transition-colors ${
                      formData.location === 'senegal'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-300 hover:border-orange-300'
                    }`}
                  >
                    Sénégal (Dakar, Thies)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, location: 'morocco'})}
                    className={`px-4 py-3 rounded-lg border transition-colors ${
                      formData.location === 'morocco'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-300 hover:border-orange-300'
                    }`}
                  >
                    Maroc (Casablanca, Rabat, Marrakech)
                  </button>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Décrivez votre projet *
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Parlez-nous de votre projet, vos objectifs, vos défis actuels..."
                />
                
                {/* Suggestions container */}
                {suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2 bg-orange-50 border-b border-orange-100 rounded-t-lg">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Suggestions intelligentes</span>
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="flex items-start space-x-3 w-full p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <span className="text-lg mt-0.5">{suggestion.icon}</span>
                          <span className="text-gray-800 text-sm">{suggestion.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center px-8 py-4 rounded-lg font-semibold transition-colors ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : contactFormVariant === 'B'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-3" />
                    Envoyer ma demande
                  </>
                )}
              </button>
            </form>

            <p className="text-sm text-gray-500 mt-4 text-center">
              * Champs obligatoires. Vos données sont protégées et conformes RGPD.
            </p>
          </div>

          {/* Contact Info & Benefits */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Nous Contacter Directement
              </h3>
              
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  const content = (
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{info.title}</h4>
                        <p className="text-gray-700">{info.value}</p>
                      </div>
                    </div>
                  );
                  
                  // For the form option, we'll scroll to the form instead of linking
                  if (info.title === "Formulaire de Contact") {
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          const formElement = document.getElementById('contact-form');
                          if (formElement) {
                            formElement.scrollIntoView({ behavior: 'smooth' });
                            // Focus on the first input field
                            const firstInput = formElement.querySelector('input');
                            if (firstInput) {
                              firstInput.focus();
                            }
                          }
                        }}
                        className="block w-full text-left hover:bg-gray-50 p-3 rounded-lg transition-colors"
                      >
                        {content}
                      </button>
                    );
                  }
                  
                  return info.link ? (
                    <a
                      key={index}
                      href={info.link}
                      target={info.link.startsWith('http') ? '_blank' : '_self'}
                      rel={info.link.startsWith('http') ? 'noopener noreferrer' : ''}
                      className="block hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={index} className="p-3">
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-orange-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Pourquoi Choisir OMA ?
              </h3>
              
              <div className="space-y-4">
                {[
                  "Consultation gratuite de 30 minutes",
                  "Devis détaillé sous 24h",
                  "Équipe 100% basée au Sénégal et au Maroc",
                  "Support client en français",
                  "Garantie satisfaction 30 jours",
                  "Maintenance et support inclus",
                  "Paiement en 3 fois sans frais",
                  "Formation équipe offerte"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h4 className="font-semibold text-red-800 mb-2">
                Support Urgent 24/7
              </h4>
              <p className="text-red-700 text-sm mb-3">
                Problème technique critique ? Contactez notre équipe d'urgence.
              </p>
              <a
                href="tel:+221701193811"
                className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                <Phone className="w-4 h-4 mr-2" />
                Appeler maintenant
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}