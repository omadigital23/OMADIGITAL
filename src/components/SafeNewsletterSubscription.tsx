// Enhanced Newsletter Subscription with comprehensive null safety
import React, { useState, useCallback } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { NewsletterSubscriptionProps } from '../types/components';
import { 
  safeString, 
  safeTrim, 
  safeCall, 
  safeErrorMessage,
  safeAsyncWithError,
  isNotNullOrUndefined 
} from '../utils/null-safety';

interface SafeNewsletterState {
  email: string;
  isLoading: boolean;
  success: boolean;
  error: string | null;
  touched: boolean;
}

export const SafeNewsletterSubscription: React.FC<NewsletterSubscriptionProps> = ({
  onSubmit,
  loading: externalLoading = false,
  success: externalSuccess = false,
  error: externalError,
  placeholder = 'Votre adresse email',
  buttonText = 'S\'abonner',
  variant = 'inline',
  className = ''
}) => {
  const [state, setState] = useState<SafeNewsletterState>({
    email: '',
    isLoading: false,
    success: false,
    error: null,
    touched: false
  });

  // Safe email validation
  const validateEmail = useCallback((email: string): string | null => {
    const trimmedEmail = safeTrim(email);
    
    if (!trimmedEmail) {
      return 'L\'adresse email est requise';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return 'Veuillez entrer une adresse email valide';
    }
    
    return null;
  }, []);

  // Safe form submission
  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Safe form data extraction
    const formData = new FormData(event.currentTarget);
    const emailValue = safeTrim(formData.get('email')?.toString());
    
    setState(prev => ({ ...prev, touched: true }));
    
    // Validate email
    const validationError = validateEmail(emailValue);
    if (validationError) {
      setState(prev => ({ ...prev, error: validationError }));
      return;
    }
    
    // Set loading state
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      success: false 
    }));
    
    try {
      // Safe async submission
      if (onSubmit) {
        const [result, error] = await safeAsyncWithError(
          Promise.resolve(onSubmit(emailValue))
        );
        
        if (error) {
          throw error;
        }
        
        // Success state
        setState(prev => ({
          ...prev,
          isLoading: false,
          success: true,
          email: '' // Clear form on success
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: safeErrorMessage(error)
      }));
    }
  }, [onSubmit, validateEmail]);

  // Safe input change handler
  const handleEmailChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = safeString(event.target?.value);
    
    setState(prev => ({
      ...prev,
      email: newEmail,
      error: prev.touched ? validateEmail(newEmail) : null
    }));
  }, [validateEmail]);

  // Determine current state (external props override internal state)
  const isLoading = externalLoading || state.isLoading;
  const hasSuccess = externalSuccess || state.success;
  const currentError = externalError ?? state.error;
  const currentEmail = state.email;

  // Variant-specific styling
  const getVariantStyles = () => {
    switch (variant) {
      case 'modal':
        return {
          container: 'bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto',
          form: 'space-y-4',
          input: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent',
          button: 'w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        };
      case 'sidebar':
        return {
          container: 'bg-gray-50 p-4 rounded-lg',
          form: 'space-y-3',
          input: 'w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm',
          button: 'w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        };
      default: // inline
        return {
          container: 'bg-white',
          form: 'flex flex-col sm:flex-row gap-2',
          input: 'flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent',
          button: 'bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap'
        };
    }
  };

  const styles = getVariantStyles();

  // Success state
  if (hasSuccess) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className="flex items-center justify-center text-green-600 space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Merci pour votre inscription !</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-gray-400" />
          </div>
          
          <input
            type="email"
            name="email"
            value={currentEmail}
            onChange={handleEmailChange}
            placeholder={placeholder}
            disabled={isLoading}
            className={`${styles.input} pl-10 ${
              currentError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
            }`}
            aria-invalid={isNotNullOrUndefined(currentError)}
            aria-describedby={currentError ? 'email-error' : undefined}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !currentEmail.trim()}
          className={styles.button}
        >
          {isLoading ? (
            <span className="flex items-center justify-center space-x-2">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Inscription...</span>
            </span>
          ) : (
            buttonText
          )}
        </button>
      </form>
      
      {/* Error display */}
      {currentError && (
        <div 
          id="email-error"
          className="mt-2 flex items-center space-x-2 text-red-600 text-sm"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{currentError}</span>
        </div>
      )}
      
      {/* GDPR compliance notice */}
      {variant !== 'inline' && (
        <p className="mt-3 text-xs text-gray-500">
          En vous inscrivant, vous acceptez de recevoir nos newsletters. 
          Vous pouvez vous désabonner à tout moment.
        </p>
      )}
    </div>
  );
};

export default SafeNewsletterSubscription;