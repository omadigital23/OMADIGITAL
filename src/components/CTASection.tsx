import React, { useState, useEffect } from 'react';
import { Send, Phone, Mail, MapPin, Clock, CheckCircle, AlertCircle, Lightbulb, ChevronDown } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useABTest, useRecordConversion } from '../hooks/useABTest';
import { useIsMobile } from '../hooks/useMediaQuery';
import { trackQuoteSubmission } from '../lib/analytics';
import { supabase, isSupabaseConfigured } from '../lib/supabase-client';
import { ctaService } from '../lib/cta-service';
import { CTAAction } from './SmartChatbot/types';
import { motion } from 'framer-motion';

// Define suggestion interface
interface FormSuggestion {
  id: string;
  text: string;
  icon: string;
  field: 'message' | 'service' | 'budget' | 'company';
  value: string;
}

export function CTASection() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  
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
  const [showOptionalFields, setShowOptionalFields] = useState(false); // Pour mobile
  
  // A/B Testing hooks
  const contactFormVariant = useABTest('contact_form');
  const recordConversion = useRecordConversion('contact_form', contactFormVariant);

  const services = [
    t('contact.services.whatsapp'),
    t('contact.services.website'),
    t('contact.services.branding'),
    t('contact.services.analytics'),
    t('contact.services.ai'),
    t('contact.services.security'),
    t('contact.services.mobile'),
    t('contact.services.consulting')
  ];

  // Budget ranges based on location
  const getBudgetRanges = () => {
    if (formData.location === 'morocco') {
      return [
        t('contact.budget_ranges.range1_dhs'),
        t('contact.budget_ranges.range2_dhs'),
        t('contact.budget_ranges.range3_dhs'),
        t('contact.budget_ranges.range4_dhs'),
        t('contact.budget_ranges.range5_dhs')
      ];
    }
    // Default to Senegal (FCFA)
    return [
      t('contact.budget_ranges.range1'),
      t('contact.budget_ranges.range2'),
      t('contact.budget_ranges.range3'),
      t('contact.budget_ranges.range4'),
      t('contact.budget_ranges.range5')
    ];
  };
  
  const budgetRanges = getBudgetRanges();

  // Generate smart suggestions based on form input
  const generateSuggestions = (field: string, value: string) => {
    const lowerValue = value.toLowerCase();
    const newSuggestions: FormSuggestion[] = [];
    
    // Suggestions for message field
    if (field === 'message') {
      if (lowerValue.includes('whatsapp') || lowerValue.includes('message') || lowerValue.includes('communication')) {
        newSuggestions.push({
          id: 'msg-wa-1',
          text: t('contact.suggestions.whatsapp_auto'),
          icon: '📱',
          field: 'message',
          value: t('contact.suggestions.whatsapp_auto')
        });
        newSuggestions.push({
          id: 'msg-wa-2',
          text: t('contact.suggestions.whatsapp_chatbot'),
          icon: '🤖',
          field: 'message',
          value: t('contact.suggestions.whatsapp_chatbot')
        });
      }
      
      if (lowerValue.includes('site') || lowerValue.includes('web') || lowerValue.includes('internet')) {
        newSuggestions.push({
          id: 'msg-web-1',
          text: t('contact.suggestions.website_fast'),
          icon: '⚡',
          field: 'message',
          value: t('contact.suggestions.website_fast')
        });
        newSuggestions.push({
          id: 'msg-web-2',
          text: t('contact.suggestions.website_ecommerce'),
          icon: '🛒',
          field: 'message',
          value: t('contact.suggestions.website_ecommerce')
        });
      }
      
      if (lowerValue.includes('brand') || lowerValue.includes('marque') || lowerValue.includes('identité')) {
        newSuggestions.push({
          id: 'msg-brand-1',
          text: t('contact.suggestions.branding'),
          icon: '🎨',
          field: 'message',
          value: t('contact.suggestions.branding')
        });
      }
      
      if (lowerValue.includes('analyse') || lowerValue.includes('dashboard') || lowerValue.includes('data')) {
        newSuggestions.push({
          id: 'msg-data-1',
          text: t('contact.suggestions.dashboard'),
          icon: '📊',
          field: 'message',
          value: t('contact.suggestions.dashboard')
        });
      }
      
      if (lowerValue.includes('ia') || lowerValue.includes('intelligence') || lowerValue.includes('automatisation')) {
        newSuggestions.push({
          id: 'msg-ia-1',
          text: t('contact.suggestions.ai_assistant'),
          icon: '🧠',
          field: 'message',
          value: t('contact.suggestions.ai_assistant')
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
        text: t('contact.suggestions.company_individual'),
        icon: '👤',
        field: 'company',
        value: t('contact.suggestions.company_individual')
      });
      newSuggestions.push({
        id: 'company-2',
        text: t('contact.suggestions.company_freelancer'),
        icon: '👨💼',
        field: 'company',
        value: t('contact.suggestions.company_freelancer')
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
    
    // If location changes, reset budget to force user to select appropriate currency
    if (name === 'location') {
      setFormData({
        ...formData,
        [name]: value,
        budget: '' // Reset budget when location changes
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
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
    if (!isSupabaseConfigured() || !supabase) {
      console.error('Supabase is not configured properly');
      setSubmitStatus('error');
      setErrors([t('contact.form_error_temporarily_unavailable') || 'Le service est temporairement indisponible']);
      return;
    }
    
    // Check if CTA service is available
    if (!ctaService) {
      console.error('CTA service is not available');
    }
    
    // Enhanced security validation using SecurityManager
    const { securityManager } = await import('../lib/security-enhanced');
    const errors: string[] = [];
    
    // Validate and sanitize name
    const nameValidation = securityManager.validateAndSanitize(formData.name, 'form');
    if (!nameValidation.isValid) {
      errors.push(t('contact.errors.name_invalid'));
    } else if (!nameValidation.sanitized.trim()) {
      errors.push(t('contact.errors.name_required'));
    } else if (nameValidation.sanitized.trim().length < 2) {
      errors.push(t('contact.errors.name_too_short'));
    } else if (nameValidation.sanitized.trim().length > 50) {
      errors.push(t('contact.errors.name_too_long'));
    } else {
      formData.name = nameValidation.sanitized;
    }
    
    // Validate email with enhanced security
    const emailValidation = securityManager.validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.threats.map(threat => 
        threat === 'Invalid email format' ? t('contact.errors.email_invalid') : t('contact.errors.email_suspicious')
      ));
    } else {
      formData.email = emailValidation.sanitized;
    }
    
    // Validate phone with enhanced security
    const phoneValidation = securityManager.validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      errors.push(...phoneValidation.threats.map(threat => 
        threat.includes('Invalid phone format') ? t('contact.errors.phone_invalid') : t('contact.errors.phone_suspicious')
      ));
    } else {
      formData.phone = phoneValidation.sanitized;
    }
    
    // Validate and sanitize company (optional)
    if (formData.company) {
      const companyValidation = securityManager.validateAndSanitize(formData.company, 'form');
      if (!companyValidation.isValid) {
        errors.push(t('contact.errors.company_invalid'));
      } else if (companyValidation.sanitized.length > 100) {
        errors.push(t('contact.errors.company_too_long'));
      } else {
        formData.company = companyValidation.sanitized;
      }
    }
    
    // Validate service (whitelist check)
    if (!formData.service) {
      errors.push(t('contact.errors.service_required'));
    } else if (!services.includes(formData.service)) {
      errors.push(t('contact.errors.service_invalid'));
    }
    
    // Validate and sanitize message
    const messageValidation = securityManager.validateAndSanitize(formData.message, 'form');
    if (!messageValidation.isValid) {
      errors.push(t('contact.errors.message_invalid'));
      if (messageValidation.riskLevel === 'critical' || messageValidation.riskLevel === 'high') {
        // Log security incident
        console.warn('High-risk content detected in form:', {
          threats: messageValidation.threats,
          riskLevel: messageValidation.riskLevel
        });
      }
    } else if (!messageValidation.sanitized.trim()) {
      errors.push(t('contact.errors.message_required'));
    } else if (messageValidation.sanitized.trim().length < 10) {
      errors.push(t('contact.errors.message_too_short'));
    } else if (messageValidation.sanitized.trim().length > 1000) {
      errors.push(t('contact.errors.message_too_long'));
    } else {
      formData.message = messageValidation.sanitized;
    }
    
    // Validate budget (whitelist check)
    if (formData.budget && !budgetRanges.includes(formData.budget)) {
      errors.push(t('contact.errors.budget_invalid'));
    }
    
    // Validate location (whitelist check)
    if (!['senegal', 'morocco'].includes(formData.location)) {
      errors.push(t('contact.errors.location_invalid'));
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
        .insert([{
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
        }] as any);

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
    
      // Track with Google Analytics 4
      trackQuoteSubmission({
        service: formData.service,
        location: formData.location,
        company: formData.company,
        budget: formData.budget
      });
    
      // ✅ SAVE CTA CONVERSION TO DATABASE
      try {
        // Generate a unique session ID if not already present
        const sessionId = typeof window !== 'undefined' ? 
          sessionStorage.getItem('sessionId') || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` :
          `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
        // Save conversion to cta_conversions table
        const { error: conversionError } = await supabase
          .from('cta_conversions')
          .insert([{
            cta_id: null, // No specific CTA associated with form submission
            session_id: sessionId,
            conversion_type: 'quote_request',
            conversion_value: null, // Could be estimated value based on service/budget
            metadata: {
              service: formData.service,
              location: formData.location,
              company: formData.company,
              budget: formData.budget,
              name: formData.name,
              email: formData.email,
              phone: formData.phone
            },
            created_at: new Date().toISOString()
          }] as any);

        if (conversionError) {
          console.error('Error saving CTA conversion:', conversionError);
        } else {
          console.log('✅ CTA conversion saved successfully');
        }
        
        // Also create a CTA action for this quote request
        try {
          // Check if CTA service is available
          if (ctaService) {
            const ctaAction = {
              type: 'quote' as const,
              action: `Demande de devis: ${formData.service}`,
              priority: 'high' as const,
              data: {
                service: formData.service,
                location: formData.location,
                company: formData.company,
                budget: formData.budget
              },
              is_active: true
            };
            
            // Save CTA action to cta_actions table
            const savedCTA = await ctaService.upsertCTA(ctaAction);
            if (savedCTA && savedCTA.id) {
              console.log('✅ CTA action created successfully:', savedCTA.id);
              
              // Track this CTA action
              await ctaService.trackCTAAction(savedCTA.id, sessionId, 'conversion', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
              });
            }
          } else {
            console.warn('CTA service not available, skipping CTA action creation');
          }
        } catch (ctaActionError) {
          console.error('Error creating CTA action:', ctaActionError);
        }
      } catch (conversionError) {
        console.error('Error saving CTA conversion:', conversionError);
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
      title: t('contact.info_form'),
      value: t('contact.info_form_desc'),
      link: null // Will scroll to the form
    },
    {
      icon: Mail,
      title: t('footer.email'),
      value: "omadigital23@gmail.com/amadou@omadigital.net",
      link: "mailto:omadigital23@gmail.com"
    },
    {
      icon: Phone,
      title: "WhatsApp",
      value: t('footer.phone'),
      link: "https://wa.me/212701193811"
    },
    {
      icon: Phone,
      title: t('header.phone'),
      value: t('footer.phone'),
      link: "tel:+212701193811"
    },
    {
      icon: MapPin,
      title: t('footer.senegal_office'),
      value: t('footer.address.senegal'),
      link: "https://maps.google.com/?q=Hersent+Rue+15+Thies+Senegal"
    },
    {
      icon: MapPin,
      title: t('footer.morocco_office'),
      value: t('footer.address.morocco'),
      link: "https://maps.google.com/?q=Moustakbal+Sidimaarouf+Casablanca+Maroc"
    },
    {
      icon: Clock,
      title: t('contact.info_hours'),
      value: t('contact.info_hours_value'),
      link: null
    }
  ];

  return (
    <section id="contact" className="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {t('contact.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div id="contact-form" className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {t('contact.form_title')}
            </h3>
            
            {submitStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800">{t('contact.form_success')}</span>
              </div>
            )}
            
            {submitStatus === 'error' && (
              errors.length > 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span className="text-red-800 font-medium">{t('contact.form_errors_title')}</span>
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
                  <span className="text-red-800">{t('contact.form_error')}</span>
                </div>
              )
            )}

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Champs essentiels - Toujours visibles */}
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    {t('contact.fields.name')}*
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors touch-manipulation"
                    placeholder={t('contact.fields.name_placeholder')}
                    autoComplete="name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    {t('contact.fields.phone')}*
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors touch-manipulation"
                    placeholder={t('contact.fields.phone_placeholder')}
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  {t('contact.fields.email')}*
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors touch-manipulation"
                  placeholder={t('contact.fields.email_placeholder')}
                  autoComplete="email"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.fields.phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={t('contact.fields.phone_placeholder')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.fields.company')}
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={t('contact.fields.company_placeholder')}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.fields.service')}
                  </label>
                  <select
                    name="service"
                    required
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">{t('contact.fields.service_placeholder')}</option>
                    {services.map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.fields.budget')} ({formData.location === 'morocco' ? 'DHS' : 'FCFA'})
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">{t('contact.fields.budget_placeholder')}</option>
                    {budgetRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.fields.location')}*
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
                    {t('contact.fields.location_senegal')}
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
                    {t('contact.fields.location_morocco')}
                  </button>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.fields.message')}
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={t('contact.fields.message_placeholder')}
                />
                
                {/* Suggestions container */}
                {suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2 bg-orange-50 border-b border-orange-100 rounded-t-lg">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">{t('contact.suggestions.title')}</span>
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

              <div>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center px-8 py-4 rounded-lg font-semibold transition-colors ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : contactFormVariant === 'B'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                  whileHover={!isSubmitting ? { scale: 1.03, y: -1, boxShadow: '0 20px 25px -5px rgba(251,146,60,0.35)' } : undefined}
                  whileTap={!isSubmitting ? { scale: 0.98, y: 0 } : undefined}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      {t('contact.form_sending')}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-3" />
                      {t('contact.form_send')}
                    </>
                  )}
                </motion.button>
                
                <p className="text-sm text-gray-500 mt-3 text-center">
                  {t('contact.form_privacy')}
                </p>
              </div>
            </form>
          </div>

          {/* Contact Info & Benefits */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {t('contact.info_title')}
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
                  if (info.title === t('contact.info_form')) {
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
                {t('contact.benefits_title')}
              </h3>
              
              <div className="space-y-4">
                {[
                  t('contact.benefits.consultation'),
                  t('contact.benefits.quote_24h'),
                  t('contact.benefits.local_team'),
                  t('contact.benefits.french_support'),
                  t('contact.benefits.guarantee'),
                  t('contact.benefits.maintenance'),
                  t('contact.benefits.payment_plan'),
                  t('contact.benefits.training')
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
                {t('contact.emergency.title')}
              </h4>
              <p className="text-red-700 text-sm mb-3">
                {t('contact.emergency.description')}
              </p>
              <a
                href="tel:+212701193811"
                className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                <Phone className="w-4 h-4 mr-2" />
                {t('contact.emergency.call_now')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}