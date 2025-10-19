import React, { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { validateContactForm, checkRateLimit, generateCSRFToken } from '../lib/security-utils';
import { useAPIPerformance } from '../hooks/useOptimizedPerformance';

// Types pour le formulaire
interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  service: string;
  budget: string;
}

interface FormErrors {
  [key: string]: string;
}

interface SubmissionState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}

// Composant de champ sécurisé
const SecureField = memo(({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  required = false,
  placeholder,
  maxLength,
  rows
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let value = e.target.value;
    
    // Sanitisation basique côté client
    value = value.replace(/[<>]/g, '');
    
    if (maxLength && value.length > maxLength) {
      value = value.slice(0, maxLength);
    }
    
    onChange(value);
  }, [onChange, maxLength]);

  const fieldId = `field-${name}`;
  const errorId = `error-${name}`;

  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={fieldId}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows || 4}
          maxLength={maxLength}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
        />
      ) : type === 'select' ? (
        <select
          id={fieldId}
          name={name}
          value={value}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
        >
          <option value="">{placeholder}</option>
          {name === 'service' && (
            <>
              <option value="whatsapp">Automatisation WhatsApp</option>
              <option value="website">Site Web Ultra-Rapide</option>
              <option value="chatbot">IA Conversationnelle</option>
              <option value="marketing">Marketing Digital</option>
              <option value="complete">Solution Complète</option>
            </>
          )}
          {name === 'budget' && (
            <>
              <option value="500-2000">500€ - 2 000€</option>
              <option value="2000-5000">2 000€ - 5 000€</option>
              <option value="5000-10000">5 000€ - 10 000€</option>
              <option value="10000+">10 000€+</option>
            </>
          )}
        </select>
      ) : (
        <input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
        />
      )}
      
      {maxLength && (
        <div className="text-xs text-gray-500 text-right">
          {value.length}/{maxLength}
        </div>
      )}
      
      <AnimatePresence>
        {error && (
          <motion.div
            id={errorId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center space-x-2 text-red-600 text-sm"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Composant principal du formulaire sécurisé
export const SecureContactForm = memo(() => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    service: '',
    budget: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    isSubmitting: false,
    isSuccess: false,
    error: null
  });
  
  const { measureAPICall } = useAPIPerformance();

  // Mise à jour sécurisée des champs
  const updateField = useCallback((field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Validation en temps réel
  const validateField = useCallback((field: keyof ContactFormData, value: string) => {
    const fieldValidation = validateContactForm({ [field]: value });
    
    if (!fieldValidation.isValid && fieldValidation.errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: fieldValidation.errors[field]
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, []);

  // Soumission sécurisée du formulaire
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérification du rate limiting
    const clientId = `${navigator.userAgent}-${window.location.hostname}`;
    if (!checkRateLimit(clientId, { maxRequestsPerWindow: 3, rateLimitWindow: 300000 })) {
      setSubmissionState({
        isSubmitting: false,
        isSuccess: false,
        error: 'Trop de tentatives. Veuillez patienter 5 minutes avant de réessayer.'
      });
      return;
    }

    setSubmissionState({ isSubmitting: true, isSuccess: false, error: null });

    try {
      // Validation complète
      const validation = validateContactForm(formData);
      
      if (!validation.isValid) {
        setErrors(validation.errors);
        setSubmissionState({
          isSubmitting: false,
          isSuccess: false,
          error: 'Veuillez corriger les erreurs dans le formulaire.'
        });
        return;
      }

      // Génération du token CSRF
      const csrfToken = generateCSRFToken();
      
      // Soumission avec mesure de performance
      await measureAPICall(async () => {
        const response = await fetch('/api/contact/secure-submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
          body: JSON.stringify({
            ...validation.sanitized,
            csrfToken,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            referrer: document.referrer
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de l\'envoi');
        }

        return response.json();
      }, 'contact_form_submit');

      // Succès
      setSubmissionState({
        isSubmitting: false,
        isSuccess: true,
        error: null
      });
      
      // Réinitialisation du formulaire après succès
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          message: '',
          service: '',
          budget: ''
        });
        setSubmissionState({
          isSubmitting: false,
          isSuccess: false,
          error: null
        });
      }, 5000);

    } catch (error) {
      console.error('Erreur soumission formulaire:', error);
      setSubmissionState({
        isSubmitting: false,
        isSuccess: false,
        error: error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite.'
      });
    }
  }, [formData, measureAPICall]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* En-tête sécurisé */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
          <Shield className="w-4 h-4 mr-2" />
          Formulaire Sécurisé SSL
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Obtenez Votre Devis Personnalisé
        </h2>
        <p className="text-gray-600">
          Toutes vos données sont protégées et chiffrées. Réponse garantie sous 2h.
        </p>
      </div>

      {/* Message de succès */}
      <AnimatePresence>
        {submissionState.isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Message envoyé avec succès !</h3>
                <p className="text-green-700 text-sm">
                  Notre équipe vous contactera sous 2h pour discuter de votre projet.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message d'erreur global */}
      <AnimatePresence>
        {submissionState.error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700 text-sm">{submissionState.error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid md:grid-cols-2 gap-6">
          <SecureField
            label="Nom complet"
            name="name"
            value={formData.name}
            onChange={(value) => updateField('name', value)}
            error={errors.name}
            required
            placeholder="Votre nom et prénom"
            maxLength={100}
          />
          
          <SecureField
            label="Email professionnel"
            name="email"
            type="email"
            value={formData.email}
            onChange={(value) => updateField('email', value)}
            error={errors.email}
            required
            placeholder="votre@email.com"
            maxLength={254}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <SecureField
            label="Téléphone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(value) => updateField('phone', value)}
            error={errors.phone}
            placeholder="+212 XX XXX XX XX"
            maxLength={20}
          />
          
          <SecureField
            label="Entreprise"
            name="company"
            value={formData.company}
            onChange={(value) => updateField('company', value)}
            error={errors.company}
            placeholder="Nom de votre entreprise"
            maxLength={200}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <SecureField
            label="Service souhaité"
            name="service"
            type="select"
            value={formData.service}
            onChange={(value) => updateField('service', value)}
            error={errors.service}
            placeholder="Choisissez un service"
          />
          
          <SecureField
            label="Budget approximatif"
            name="budget"
            type="select"
            value={formData.budget}
            onChange={(value) => updateField('budget', value)}
            error={errors.budget}
            placeholder="Sélectionnez votre budget"
          />
        </div>

        <SecureField
          label="Décrivez votre projet"
          name="message"
          type="textarea"
          value={formData.message}
          onChange={(value) => updateField('message', value)}
          error={errors.message}
          required
          placeholder="Décrivez vos besoins, objectifs et défis actuels..."
          maxLength={2000}
          rows={6}
        />

        {/* Informations de sécurité */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Vos données sont protégées</p>
              <ul className="space-y-1 text-xs">
                <li>• Chiffrement SSL/TLS de bout en bout</li>
                <li>• Conformité RGPD garantie</li>
                <li>• Aucune donnée partagée avec des tiers</li>
                <li>• Suppression automatique après traitement</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={submissionState.isSubmitting || submissionState.isSuccess}
          className={`w-full px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
            submissionState.isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : submissionState.isSuccess
              ? 'bg-green-500 cursor-default'
              : 'bg-orange-500 hover:bg-orange-600 hover:shadow-lg transform hover:-translate-y-0.5'
          } text-white`}
        >
          {submissionState.isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Envoi en cours...</span>
            </>
          ) : submissionState.isSuccess ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Message envoyé !</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Envoyer ma demande</span>
            </>
          )}
        </button>

        {/* Engagement de réponse */}
        <div className="text-center text-sm text-gray-600">
          <p>
            🚀 <strong>Réponse garantie sous 2h</strong> en jours ouvrés
          </p>
          <p className="mt-1">
            📞 Ou appelez directement : <a href="tel:+212701193811" className="text-orange-600 hover:text-orange-700 font-medium">+212 70 119 38 11</a>
          </p>
        </div>
      </form>
    </div>
  );
});

SecureContactForm.displayName = 'SecureContactForm';